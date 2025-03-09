import { APIGatewayEventRequestContextWithAuthorizer, APIGatewayEventDefaultAuthorizerContext, S3Event } from 'aws-lambda';

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

export const customS3Event: S3Event = {
  Records: [{
    eventVersion: "",
    eventSource: "",
    awsRegion: "",
    eventTime: "",
    eventName: "",
    userIdentity: {
        principalId: "",
    },
    requestParameters: {
        sourceIPAddress: "",
    },
    responseElements: {
        "x-amz-request-id": "",
        "x-amz-id-2": "",
    },
    s3: {
        s3SchemaVersion: "",
        configurationId: "",
        bucket: {
            name: "bucket",
            ownerIdentity: {
                principalId: "",
            },
            arn: "",
        },
        object: {
            key: "upload/key",
            size: 0,
            eTag: "",
            versionId: "",
            sequencer: "",
        },
    },
  }],
}
