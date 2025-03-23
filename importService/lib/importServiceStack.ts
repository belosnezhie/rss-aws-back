import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as path from 'path';
import * as s3n from 'aws-cdk-lib/aws-s3-notifications';
import * as iam from 'aws-cdk-lib/aws-iam';

export class ImportServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = s3.Bucket.fromBucketName(
      this,
      'ImportBucket',
      'import-bucket-mycdkappstack'
    );

    // Import
    const ImportProductsFileFunction = new NodejsFunction(this, 'ImportProductsFileFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'handler',
      entry: path.join(__dirname, '../lambdaFunctions/importProductsFile.ts'),
      environment: {
        BUCKET_NAME: bucket.bucketName,
      },
      bundling: {
        externalModules: [],
        minify: true,
        sourceMap: true,
      },
    });

    // Parser
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

    // Permissions
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

    const api = new apigateway.RestApi(this, 'ImportApi', {
      restApiName: 'Import Service',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowCredentials: true,
        allowHeaders: ['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key', 'X-Amz-Security-Token', 'X-Amz-User-Agent']
      }
    });

    const integration = new apigateway.LambdaIntegration(ImportProductsFileFunction, {
      proxy: true,
      integrationResponses: [{
        statusCode: '200',
        responseParameters: {
          'method.response.header.Access-Control-Allow-Origin': "'*'",
          'method.response.header.Access-Control-Allow-Headers': "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
          'method.response.header.Access-Control-Allow-Methods': "'GET,POST,PUT,DELETE,OPTIONS'"
        }
      }]
    });

    const resource = api.root.addResource('import');
    resource.addMethod('GET', integration, {
      requestParameters: {
        'method.request.querystring.name': true
      },
      methodResponses: [{
        statusCode: '200',
        responseParameters: {
          'method.response.header.Access-Control-Allow-Origin': true,
          'method.response.header.Access-Control-Allow-Headers': true,
          'method.response.header.Access-Control-Allow-Methods': true,
        }
      }]
    });
  }
}
