import { SQSEvent, SQSRecord } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  TransactWriteCommand,
  TransactWriteCommandInput
} from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { ProductRequest } from '../model/model';
import { isValidProductRequestData } from '../utils/isValidProductRequestData';
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const snsClient = new SNSClient({});
const topicArn = process.env.SNS_TOPIC_ARN;

const PRODUCTS_TABLE = "rss-aws-shop-products";
const STOCKS_TABLE = "rss-aws-shop-stocks";

export const handler = async (event: SQSEvent): Promise<void> => {
  try {
    for (const record of event.Records) {
      await processProduct(record);
    }

    console.log(`Successfully processed ${event.Records.length} messages`);
  } catch (error) {
    console.error('Error processing batch:', error);
    throw error;
  }
};

async function processProduct(record: SQSRecord): Promise<void> {
  try {
    console.log('Processing product:', record.body)
    const productData: ProductRequest = JSON.parse(record.body, (key, value) => {
      if (key === 'price' || key === 'count') {
        return Number(value);
      } else {
        return value;
      }
    });

    console.log('Product data:', productData);

    if (!isValidProductRequestData(productData)) {
      console.log('Invalid product data. Required fields: title, description, price, count')
    }

    const productId = uuidv4();

    const transactItems = [
      {
        Put: {
          TableName: PRODUCTS_TABLE,
          Item: {
            id: productId,
            title: productData.title,
            description: productData.description,
            price: productData.price,
          },
          ConditionExpression: 'attribute_not_exists(id)'
        }
      },
      {
        Put: {
          TableName: STOCKS_TABLE,
          Item: {
            product_id: productId,
            count: productData.count,
          },
          ConditionExpression: 'attribute_not_exists(product_id)'
        }
      }
    ];

    const command: TransactWriteCommandInput = {
      TransactItems: transactItems
    };

    await docClient.send(new TransactWriteCommand(command));
    console.log(`Successfully created product and stock with ID: ${productId}`);

    await sendMessage(productData);

  } catch (error) {
    console.error('Transaction failed:', error);
    throw error;
  }
}

async function sendMessage(productData: ProductRequest) {
  const message = {
    products: productData,
    price: productData.price,
  };

  try {
    await snsClient.send(new PublishCommand({
      TopicArn: topicArn,
      Message: JSON.stringify(message),
      MessageAttributes: {
        price: {
          DataType: 'Number',
          StringValue: productData.price.toString()
        },
      }
    }));
    console.log('Message sent successfully');
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}
