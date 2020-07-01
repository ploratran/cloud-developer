import { SNSHandler, SNSEvent, S3Event } from 'aws-lambda'
import 'source-map-support/register'
import * as AWS  from 'aws-sdk'

const docClient = new AWS.DynamoDB.DocumentClient()

const connectionsTable = process.env.CONNECTIONS_TABLE
const stage = process.env.STAGE
const apiId = process.env.API_ID

const connectionParams = {
  apiVersion: "2018-11-29",
  endpoint: `${apiId}.execute-api.us-east-2.amazonaws.com/${stage}`
}

const apiGateway = new AWS.ApiGatewayManagementApi(connectionParams)

// use SNS event from aws-lambda
export const handler: SNSHandler = async (event: SNSEvent) => {
  console.log('Processing SNS event ', JSON.stringify(event))
  
  for (const snsRecord of event.Records) {
    const s3EventStr = snsRecord.Sns.Message
    console.log('Processing S3 event', s3EventStr)
    const s3Event = JSON.parse(s3EventStr)

    await processS3Event(s3Event)
  }
}

async function processS3Event(s3Event: S3Event) {

  // loop thru records from S3 bucket: 
  for (const record of s3Event.Records) {
    // get a key of object for every record added to S3: 
    const key = record.s3.object.key
    console.log('Processing S3 item with key: ', key)

    // use SCAN to get list of connection in connectionsTable: 
    const connections = await docClient.scan({
        TableName: connectionsTable
    }).promise()

    const payload = {
        imageId: key
    }

    for (const connection of connections.Items) {
        // get connectionsId from connectionsTable items: 
        const connectionId = connection.id
        // send message to the specified connecitonID with payload: 
        await sendMessageToClient(connectionId, payload)
    }
  }
}

async function sendMessageToClient(connectionId, payload) {
  try {
    console.log('Sending message to a connection', connectionId)

    // use postToConnection on API Gateway
    // send message to specific connection by connectionId: 
    await apiGateway.postToConnection({
      // specify connection ID of where we want to send this message: 
      ConnectionId: connectionId,
      // send imageID as data
      Data: JSON.stringify(payload),
    }).promise()

  } catch (e) {
    console.log('Failed to send message', JSON.stringify(e))
    if (e.statusCode === 410) {
      // when connectionID exists in DynamoDB but it wasn't deleted: 
      console.log('Stale connection')

      // delete connection based on connectionId in connectionsTable: 
      await docClient.delete({
        TableName: connectionsTable,
        Key: {
          id: connectionId
        }
      }).promise()

    }
  }
}