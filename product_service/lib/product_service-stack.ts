import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as path from 'path';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';

export class ProductServiceStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const getProductsListFunction = new NodejsFunction(this, 'getProductsListFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'handler',
      entry: path.join(__dirname, '../lambda_functions/getProductsList.ts'),
      functionName: 'getProductsList',
      bundling: {
        externalModules: [],
        minify: true,
        sourceMap: true,
      }
    });

    const getProductsByIdFunction = new NodejsFunction(this, 'getProductsByIdFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'handler',
      entry: path.join(__dirname, '../lambda_functions/getProductsById.ts'),
      functionName: 'getProductsById',
      bundling: {
        externalModules: [],
        minify: true,
        sourceMap: true,
      }
    });

    const api = new apigateway.RestApi(this, 'ProductsApi', {
      restApiName: 'Products Service',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS
      }
    });

    const products = api.root.addResource('products');
    products.addMethod('GET', new apigateway.LambdaIntegration(getProductsListFunction));

    const product = products.addResource('{productId}');
    product.addMethod('GET', new apigateway.LambdaIntegration(getProductsByIdFunction));
  }
}


