import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as AWS  from 'aws-sdk'
import * as uuid from 'uuid'

const docClient = new AWS.DynamoDB.DocumentClient()

const groupsTable = process.env.GROUPS_TABLE
const imagesTable = process.env.IMAGES_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Caller event', event)
  
  // get groupId from url path: 
  const groupId = event.pathParameters.groupId
  // check group validity: 
  const validGroupId = await groupExists(groupId)

  // return 404 error if image group not exist: 
  if (!validGroupId) {
    return {
      statusCode: 404,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: 'Group does not exist'
      })
    }
  }

  // TODO: Create an image //

  // generate unique id for each image: 
  const imageId = uuid.v4(); 

  const newImage = await createImage(groupId, imageId, event); 
  
  // END TODO //

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    // return JSON object of newly created image: 
    body: JSON.stringify({
      newImage,
    })
  }
}

async function groupExists(groupId: string) {
  const result = await docClient.get({
      TableName: groupsTable,
      Key: {
        id: groupId
      }
    }).promise()

  console.log('Get group: ', result)
  return !!result.Item
}

async function createImage(groupId: string, imageId: string, event: any) {

  const timestamp = new Date().toISOString();
  const parsedBody = JSON.parse(event.body); 

  const newImage = {
    groupId, 
    imageId,
    timestamp, 
    ...parsedBody, 
  }

  // write new item into Dynamodb table:
  await docClient.put({
    TableName: imagesTable,
    Item: newImage
  }).promise()

  console.log('New image aded: ' + newImage); 

  return newImage; 
}