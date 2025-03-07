import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as path from 'path';
import * as s3n from 'aws-cdk-lib/aws-s3-notifications';

export class ImportServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = s3.Bucket.fromBucketName(
      this,
      'ImportBucket',
      'import-bucket-mycdkappstack'
    );

    const ImportProductsFileFunction = new NodejsFunction(this, 'ImportProductsFileFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'handler',
      entry: path.join(__dirname, '../lambdaFunctions/importProductsFile.ts'),
      functionName: 'ImportProductsFile',
      environment: {
        BUCKET_NAME: bucket.bucketName,
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
      entry: path.join(__dirname, '../lambdaFunctions/ImportFileParser.ts'),
      code: lambda.Code.fromAsset('lambda'),
      environment: {
        BUCKET_NAME: bucket.bucketName,
      },
      bundling: {
        externalModules: [],
        minify: true,
        sourceMap: true,
      },
    });

    bucket.grantPut(ImportProductsFileFunction);
    bucket.grantReadWrite(ImportProductsFileFunction);
    bucket.grantReadWrite(importFileParserFunction);


    bucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3n.LambdaDestination(importFileParserFunction),
      { prefix: 'uploaded/' }
    );

    const api = new apigateway.RestApi(this, 'ImportApi', {
      restApiName: 'Import Service',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS
      }
    });

    const importIntegration = new apigateway.LambdaIntegration(ImportProductsFileFunction);
    const importResource = api.root.addResource('import');
    importResource.addMethod('GET', importIntegration, {
      requestParameters: {
        'method.request.querystring.name': true
      }
    });
  }
}
