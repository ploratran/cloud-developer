import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as AWS  from 'aws-sdk'
import * as uuid from 'uuid'

const docClient = new AWS.DynamoDB.DocumentClient()

// use S3 AWS: 
const s3 = new AWS.S3({
  signatureVersion: 'v4' // Use Sigv4 algorithm
})

const groupsTable = process.env.GROUPS_TABLE
const imagesTable = process.env.IMAGES_TABLE
const bucketName = process.env.IMAGES_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Caller event', event)
  const groupId = event.pathParameters.groupId
  const validGroupId = await groupExists(groupId)

  // if not valid group id, return 404 error:
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

  const imageId = uuid.v4() // generate unique iamge id
  const newItem = await createImage(groupId, imageId, event)

  // get a presigned S3 URL: 
  const url = getUploadUrl(imageId)

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      newItem: newItem,
      // return URL used to upload file for specific image created by API call to DynamoDB
      uploadUrl: url
    })
  }
}

async function groupExists(groupId: string) {

  // send Get method to get an item with specified key in groupsTable: 
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
  const timestamp = new Date().toISOString()
  const newImage = JSON.parse(event.body) // image "title" property

  const newItem = {
    groupId,
    timestamp,
    imageId,
    ...newImage,
    // image url for S3 bucket: 
    imageUrl: `https://${bucketName}.s3.amazonaws.com/${imageId}`
  }
  console.log('Storing new item: ', newItem)

  // write new item into imagesTable DynamoDB: 
  await docClient.put({
      TableName: imagesTable,
      Item: newItem
    }).promise()

  return newItem
}

function getUploadUrl(imageId: string) {
  return s3.getSignedUrl('putObject', { // event: PUT to allow upload/read object
    Bucket: bucketName, // name of S3 bucket
    Key: imageId, // id of object this URL allow access to 
    Expires: +urlExpiration // URL expiration time as number type
  })
}
