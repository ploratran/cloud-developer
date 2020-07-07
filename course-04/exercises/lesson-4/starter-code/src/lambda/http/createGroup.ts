import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as AWS  from 'aws-sdk'
import * as uuid from 'uuid'

import * as middy from 'middy'
import { cors } from 'middy/middlewares'

// use helper function to store an Id of a user when create a new item: 
import { getUserId } from '../../auth/util' 

const docClient = new AWS.DynamoDB.DocumentClient()
const groupsTable = process.env.GROUPS_TABLE

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Processing event: ', event)
  const itemId = uuid.v4()

  const parsedBody = JSON.parse(event.body)

  // get JWT token in an event handler: 
  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]

  // extract user ID from a JWT token using getUserId: 
  const userId = getUserId(jwtToken); 

  const newItem = {
    id: itemId, // store user Id into DynamoDB groupsTable 
    userId, 
    ...parsedBody,
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

