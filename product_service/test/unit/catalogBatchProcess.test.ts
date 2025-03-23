// import { SQSEvent, SQSMessageAttributes, SQSRecordAttributes } from 'aws-lambda';
// import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
// // import { handlerInner, sendMessage } from '../../lambdaFunctions/catalogBatchProcess';
// import { ProductRequest } from '../../model/model';
// import { MockSNSClient } from './testData';

// const customEvent: SQSEvent = {
//   Records: [
//     {
//       messageId: '',
//       receiptHandle: '',
//       body: '',
//       attributes: {} as SQSRecordAttributes,
//       messageAttributes: {} as SQSMessageAttributes,
//       md5OfBody: '',
//       eventSource: '',
//       eventSourceARN: '',
//       awsRegion: '',
//     },
//   ],
// };

// describe('Lambda Function Tests', () => {
//   let consoleLogMock = jest.spyOn(global.console, 'log');

//   beforeEach(() => {
//     consoleLogMock = jest.spyOn(global.console, 'log');
//   });

//   afterEach(() => {
//     consoleLogMock.mockRestore();
//   });

//   it('works OK', async () => {
//     const result = await handlerInner(customEvent, async () => true);

//     expect(result).toEqual(true);
//   });

//   test('send message works', async () => {
//     const snsClient = new MockSNSClient({});

//     const productData: ProductRequest = {
//       title: "test",
//       description: "test",
//       price: 1,
//       count: 1,
//     }
//     const result = await sendMessage(productData, snsClient);

//     expect(snsClient.invocationStack).toHaveLength(1);
//   });
// });
