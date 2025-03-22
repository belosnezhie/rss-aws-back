import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as path from 'path';
import * as s3n from 'aws-cdk-lib/aws-s3-notifications';
import * as iam from 'aws-cdk-lib/aws-iam';
import 'dotenv/config';

export class ImportServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const authorizerFunction = lambda.Function.fromFunctionArn(
      this,
      'BasicAuthorizerFunction',
      cdk.Fn.importValue('BasicAuthorizerFunctionArn')
    );

    // const authorizerFunction = cdk.Fn.importValue('BasicAuthorizerFunctionArn');

    const authorizer = new apigateway.TokenAuthorizer(this, 'ImportAuthorizer', {
      handler: authorizerFunction,
      identitySource: apigateway.IdentitySource.header('Authorization'),
      resultsCacheTtl: cdk.Duration.minutes(4)
    });

    const bucket = s3.Bucket.fromBucketName(
      this,
      'ImportBucket',
      'import-bucket-mycdkappstack'
    );

    const ImportProductsFileFunction = new NodejsFunction(this, 'ImportProductsFileFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'handler',
      entry: path.join(__dirname, '../lambdaFunctions/importProductsFile.ts'),
      environment: {
        BUCKET_NAME: bucket.bucketName,
        SQS_URL: process.env.SQS_URL || '',
      },
      bundling: {
        externalModules: [],
        minify: true,
        sourceMap: true,
      },
    });

    const importFileParserFunction = new NodejsFunction(this, 'ImportFileParserFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'handler',
      entry: path.join(__dirname, '../lambdaFunctions/importFileParser.ts'),
      environment: {
        BUCKET_NAME: bucket.bucketName,
      },
      bundling: {
        externalModules: [],
        minify: true,
        sourceMap: true,
      },
    });

    importFileParserFunction.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'sqs:SendMessage',
        'sqs:SendMessageBatch'
      ],
      resources: [
        `arn:aws:sqs:${this.region}:${this.account}:catalogItemsQueue`
      ]
    }));

    importFileParserFunction.addEnvironment('SQS_QUEUE_URL', 'https://sqs.eu-central-1.amazonaws.com/160885264704/catalogItemsQueue');


    bucket.grantPut(ImportProductsFileFunction);
    bucket.grantReadWrite(ImportProductsFileFunction);
    bucket.grantReadWrite(importFileParserFunction);
    bucket.grantDelete(importFileParserFunction);
    bucket.grantRead(importFileParserFunction);
    bucket.grantWrite(importFileParserFunction);
    bucket.grantPut(importFileParserFunction);

    bucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3n.LambdaDestination(importFileParserFunction),
      { prefix: 'uploaded/' }
    );

    const apiGatewayRole = new iam.Role(this, 'ApiGatewayRole', {
      assumedBy: new iam.ServicePrincipal('apigateway.amazonaws.com'),
    });

    apiGatewayRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ['lambda:InvokeFunction'],
        resources: [
          authorizerFunction.functionArn,
          ImportProductsFileFunction.functionArn
        ],
      })
    );

    const api = new apigateway.RestApi(this, 'ImportApi', {
      restApiName: 'Import Service',
      deployOptions: {
        stageName: 'dev',
      },
      defaultCorsPreflightOptions: {
        allowOrigins: ['*'],
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: [
          'Content-Type',
          'X-Amz-Date',
          'Authorization',
          'X-Api-Key',
          'X-Amz-Security-Token'
        ],
        allowCredentials: true
      }
    });

    api.addGatewayResponse('DEFAULT_4XX', {
      type: apigateway.ResponseType.DEFAULT_4XX,
      responseHeaders: {
        'Access-Control-Allow-Origin': "'*'",
        'Access-Control-Allow-Headers': "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
        'Access-Control-Allow-Methods': "'GET,OPTIONS'",
        'Access-Control-Allow-Credentials': "'true'"
      },
      templates: {
        'application/json': '{"message": "$context.authorizer.message"}',
      },
    });

    api.addGatewayResponse('UnauthorizedResponse', {
      type: apigateway.ResponseType.UNAUTHORIZED,
      responseHeaders: {
        'Access-Control-Allow-Origin': "'*'",
        'Access-Control-Allow-Headers': "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
        'Access-Control-Allow-Methods': "'GET,OPTIONS'",
        'Access-Control-Allow-Credentials': "'true'"
      },
      statusCode: '401',
      templates: {
        'application/json': '{"message": "Authorization required"}'
      }
    });

    api.addGatewayResponse('AccessDeniedResponse', {
      type: apigateway.ResponseType.ACCESS_DENIED,
      responseHeaders: {
        'Access-Control-Allow-Origin': "'*'",
        'Access-Control-Allow-Headers': "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
        'Access-Control-Allow-Methods': "'GET,OPTIONS'",
        'Access-Control-Allow-Credentials': "'true'"
      },
      statusCode: '403',
      templates: {
        'application/json': '{"message": "Access denied"}'
      }
    });

    const importIntegration = new apigateway.LambdaIntegration(ImportProductsFileFunction, {
      proxy: false,
      credentialsRole: apiGatewayRole,
      integrationResponses: [
        {
          statusCode: '200',
          responseParameters: {
            'method.response.header.Access-Control-Allow-Origin': "'*'",
            'method.response.header.Access-Control-Allow-Credentials': "'true'",
            'method.response.header.Access-Control-Allow-Headers': "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
            'method.response.header.Access-Control-Allow-Methods': "'GET,OPTIONS'"
          },
        }
      ],
      requestTemplates: {
        'application/json': '{ "statusCode": 200 }'
      }
    });

    const importResource = api.root.addResource('import');

    importResource.addMethod('GET', importIntegration, {
      authorizationType: apigateway.AuthorizationType.CUSTOM,
      authorizer: authorizer,
      methodResponses: [
        {
          statusCode: '200',
          responseParameters: {
            'method.response.header.Access-Control-Allow-Origin': true,
            'method.response.header.Access-Control-Allow-Credentials': true,
            'method.response.header.Access-Control-Allow-Headers': true,
            'method.response.header.Access-Control-Allow-Methods': true
          },
        }
      ],
      requestParameters: {
        'method.request.querystring.name': true,
      },
    });
  }
}
