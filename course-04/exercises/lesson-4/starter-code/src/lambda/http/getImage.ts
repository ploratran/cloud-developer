import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import 'source-map-support/register'
import * as AWS  from 'aws-sdk'

const docClient = new AWS.DynamoDB.DocumentClient()

const imagesTable = process.env.IMAGES_TABLE
const imageIdIndex = process.env.IMAGE_ID_INDEX

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Caller event', event)
  const imageId = event.pathParameters.imageId

  // use query instead of scan to get each item, instead of all items:
  const result = await docClient.query({
      TableName : imagesTable,
      IndexName : imageIdIndex,
      KeyConditionExpression: 'imageId = :imageId',
      ExpressionAttributeValues: {
          ':imageId': imageId
      }
  }).promise()

  // check if there is more than 0 item in imagesTable: 
  if (result.Count !== 0) {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(result.Items[0]) // return the first item in the table 
    }
  }

  return {
    statusCode: 404,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: ''
  }
}
