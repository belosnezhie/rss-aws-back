import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import 'dotenv/config';
import * as path from 'path';
import * as iam from 'aws-cdk-lib/aws-iam';

export class AuthorizationServiceStack extends cdk.Stack {
  public readonly basicAuthorizerFunction: lambda.Function;

  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.basicAuthorizerFunction = new NodejsFunction(this, 'BasicAuthorizerFunction', {
      functionName: 'basicAuthorizerFunction',
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'handler',
      entry: path.join(__dirname, '../lambdaFunctions/basicAuthorizer.ts'),
      environment: {
        'credentials': process.env.CREDENTIALS || '',
      },
      bundling: {
        minify: true,
        sourceMap: true,
      },
    });

    this.basicAuthorizerFunction.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          'logs:CreateLogGroup',
          'logs:CreateLogStream',
          'logs:PutLogEvents'
        ],
        resources: ['*']
      })
    );

    new cdk.CfnOutput(this, 'BasicAuthorizerFunctionArn', {
      value: this.basicAuthorizerFunction.functionArn,
      description: 'Authorizer Lambda Function ARN',
      exportName: 'BasicAuthorizerFunctionArn',
    });

    this.basicAuthorizerFunction.addPermission("APIGatewayInvokePermission", {
      principal: new cdk.aws_iam.ServicePrincipal("apigateway.amazonaws.com"),
      action: "lambda:InvokeFunction",
    })
  }
}
