import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as path from 'path';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as iam from 'aws-cdk-lib/aws-iam';

export class ProductServiceStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const getProductsListFunction = new NodejsFunction(this, 'getProductsListFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'handler',
      entry: path.join(__dirname, '../lambdaFunctions/getProductsList.ts'),
      functionName: 'getProductsList',
      bundling: {
        externalModules: [],
        minify: true,
        sourceMap: true,
      }
    });

    getProductsListFunction.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'dynamodb:Scan',
        'dynamodb:Query',
        'dynamodb:GetItem'
      ],
      resources: [
        `arn:aws:dynamodb:${this.region}:${this.account}:table/rss-aws-shop-products`,
        `arn:aws:dynamodb:${this.region}:${this.account}:table/rss-aws-shop-stocks`
      ]
    }));

    const getProductsByIdFunction = new NodejsFunction(this, 'getProductsByIdFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'handler',
      entry: path.join(__dirname, '../lambdaFunctions/getProductsById.ts'),
      functionName: 'getProductsById',
      bundling: {
        externalModules: [],
        minify: true,
        sourceMap: true,
      }
    });

    getProductsByIdFunction.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'dynamodb:Scan',
        'dynamodb:Query',
        'dynamodb:GetItem'
      ],
      resources: [
        `arn:aws:dynamodb:${this.region}:${this.account}:table/rss-aws-shop-products`,
        `arn:aws:dynamodb:${this.region}:${this.account}:table/rss-aws-shop-stocks`
      ]
    }));

    const createProductFunction = new NodejsFunction(this, 'createProductFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'handler',
      entry: path.join(__dirname, '../lambdaFunctions/createProduct.ts'),
      functionName: 'createProduct',
      bundling: {
        externalModules: [],
        minify: true,
        sourceMap: true,
      }
    });

    createProductFunction.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'dynamodb:Scan',
        'dynamodb:Query',
        'dynamodb:PutItem'
      ],
      resources: [
        `arn:aws:dynamodb:${this.region}:${this.account}:table/rss-aws-shop-products`,
      ]
    }));

    const api = new apigateway.RestApi(this, 'ProductsApi', {
      restApiName: 'Products Service',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS
      }
    });

    const products = api.root.addResource('products');
    products.addMethod('GET', new apigateway.LambdaIntegration(getProductsListFunction));
    products.addMethod('POST', new apigateway.LambdaIntegration(createProductFunction));

    const product = products.addResource('{productId}');
    product.addMethod('GET', new apigateway.LambdaIntegration(getProductsByIdFunction));
  }
}


