import { APIGatewayEventRequestContextWithAuthorizer, APIGatewayEventDefaultAuthorizerContext } from 'aws-lambda';

export const customEvent = {
  body: null,
  headers: {},
  multiValueHeaders: {},
  httpMethod: '',
  isBase64Encoded: true,
  path: '',
  pathParameters: { ['productId']: ''},
  queryStringParameters: null,
  multiValueQueryStringParameters: null,
  stageVariables: null,
  requestContext: {} as APIGatewayEventRequestContextWithAuthorizer<APIGatewayEventDefaultAuthorizerContext>,
  resource: '',
}
