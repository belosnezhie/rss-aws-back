import * as cdk from 'aws-cdk-lib';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as path from 'path';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambdaEventSources from 'aws-cdk-lib/aws-lambda-event-sources';
import * as sns from 'aws-cdk-lib/aws-sns';

export class ProductServiceStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const catalogItemsQueue = new sqs.Queue(this, 'CatalogItemsQueue', {
      queueName: 'catalogItemsQueue',
      visibilityTimeout: cdk.Duration.seconds(30),
    });

    const createProductTopic = new sns.Topic(this, 'CreateProductTopic', {
      displayName: 'Create Product Topic'
    });

    new sns.Subscription(this, 'CreateProductEmailSubscription', {
      topic: createProductTopic,
      protocol: sns.SubscriptionProtocol.EMAIL,
      endpoint: 'annaneveda@gmail.com'
    });

    new sns.Subscription(this, 'PriceyProductsSubscription', {
      topic: createProductTopic,
      protocol: sns.SubscriptionProtocol.EMAIL,
      endpoint: 'dmitry@romashov.tech',
      filterPolicy: {
        price: sns.SubscriptionFilter.numericFilter({
          greaterThan: 400
        })
      }
    });

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
        'dynamodb:PutItem',
        'dynamodb:TransactWriteItems'
      ],
      resources: [
        `arn:aws:dynamodb:${this.region}:${this.account}:table/rss-aws-shop-products`,
        `arn:aws:dynamodb:${this.region}:${this.account}:table/rss-aws-shop-stocks`
      ]
    }));


    const catalogBatchProcess = new NodejsFunction(this, 'CatalogBatchProcessFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'handler',
      entry: path.join(__dirname, '../lambdaFunctions/catalogBatchProcess.ts'),
      functionName: 'catalogBatchProcess',
      bundling: {
        externalModules: [],
        minify: true,
        sourceMap: true,
      }
    });

    catalogBatchProcess.addEventSource(new lambdaEventSources.SqsEventSource(catalogItemsQueue, {
      batchSize: 5,
      reportBatchItemFailures: true,
    }));

    catalogBatchProcess.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'dynamodb:PutItem',
        'dynamodb:TransactWriteItems',
        'dynamodb:BatchWriteItem',
        'sns:Publish'
      ],
      resources: [
        `arn:aws:dynamodb:${this.region}:${this.account}:table/rss-aws-shop-products`,
        `arn:aws:dynamodb:${this.region}:${this.account}:table/rss-aws-shop-stocks`,
        createProductTopic.topicArn
      ]
    }));

    catalogBatchProcess.addEnvironment('SNS_TOPIC_ARN', createProductTopic.topicArn);

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


