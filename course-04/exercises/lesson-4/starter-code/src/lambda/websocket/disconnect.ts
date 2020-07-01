/**
 * Implement Websocket for 'disconnect' event
 */

import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as AWS  from 'aws-sdk'

const docClient = new AWS.DynamoDB.DocumentClient()

const connectionsTable = process.env.CONNECTIONS_TABLE // DynamodB table to store connectionId

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Websocket disconnect', event)

  // get connectionId from APIGateway Websocket event
  const connectionId = event.requestContext.connectionId

  // specify key to delete in connectionsTable: 
  const key = {
      id: connectionId
  }

  console.log('Removing item with key: ', key)

  // use DELETE method to delete item with specified key: 
  await docClient.delete({
    TableName: connectionsTable,
    Key: key // delete by 'connectionId' in Websocket
  }).promise()

  return {
    statusCode: 200,
    body: ''
  }
}
