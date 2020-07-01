import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as AWS  from 'aws-sdk'

const docClient = new AWS.DynamoDB.DocumentClient()

const connectionsTable = process.env.CONNECTIONS_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Websocket connect', event)

  // get connectionId from $connect and $disconnect Websocket event: 
  const connectionId = event.requestContext.connectionId
  const timestamp = new Date().toISOString()

  // create item with connectionId to stored into connectionsTable in DynamoDB: 
  const item = {
    id: connectionId,
    timestamp
  }

  console.log('Storing item: ', item)

  // using PUT method to stored connectionId into connectionsTable: 
  await docClient.put({
    TableName: connectionsTable,
    Item: item
  }).promise()

  return {
    statusCode: 200,
    body: ''
  }
}
