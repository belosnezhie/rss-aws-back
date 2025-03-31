import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as path from 'path';
import 'dotenv/config';

function getEnvVariablesMap(): { [key: string]: string} {
  const envMap = new Map<string, string>();
  for (const key in process.env) {
      if (key !== undefined) {
        envMap.set(key, process.env[key] || "");
      }
  }

  let env : { [key: string]: string} = {};
  for (const key in envMap) {
    env[key] = envMap.get(key) || "";
  }
  return env;
}

export class AuthorizationServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const basicAuthorizerFunction = new NodejsFunction(this, 'BasicAuthorizerFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'handler',
      entry: path.join(__dirname, '../lambdaFunctions/basicAuthorizer.ts'),
      environment: getEnvVariablesMap(),
    });

    basicAuthorizerFunction.addPermission('APIGatewayInvokePermission', {
      principal: new iam.ServicePrincipal('apigateway.amazonaws.com'),
      action: 'lambda:InvokeFunction',
    });

    // logs
    new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'logs:CreateLogGroup',
        'logs:CreateLogStream',
        'logs:PutLogEvents'
      ],
      resources: ['*']
    });

    new cdk.CfnOutput(this, 'BasicAuthorizerFunctionArn', {
      value: basicAuthorizerFunction.functionArn,
      exportName: 'BasicAuthorizerFunctionArn',
    });
  }
}
