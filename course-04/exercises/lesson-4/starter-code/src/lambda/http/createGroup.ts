import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as AWS  from 'aws-sdk'
import * as uuid from 'uuid'

import * as middy from 'middy'
import { cors } from 'middy/middlewares'

const docClient = new AWS.DynamoDB.DocumentClient()
const groupsTable = process.env.GROUPS_TABLE

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Processing event: ', event)
  const itemId = uuid.v4()

  const parsedBody = JSON.parse(event.body)

  const newItem = {
    id: itemId,
    ...parsedBody
  }

  await docClient.put({
    TableName: groupsTable,
    Item: newItem
  }).promise()

  return {
    statusCode: 201,
    // remove because middy will add CORS headers:
    // headers: {
    //   'Access-Control-Allow-Origin': '*',
    //   'Access-Control-Allow-Credentials': true, 
    // },
    body: JSON.stringify({
      newItem
    })
  }
})

// use cors middleware: 
handler.use(cors({
  // allow headers that allow to send credentials to browser: 
  credentials: true, 
}))

