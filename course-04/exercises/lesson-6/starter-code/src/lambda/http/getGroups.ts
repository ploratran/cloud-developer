// no interaction with DynamoDB directly: 
import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import { getAllGroups } from '../../businessLogic/groups';

// use Express with AWS Lambda: 
// import * as express from 'express';
// import * as awsServerlessExpress from 'aws-serverless-express'; 

// handler to get all groups: 
export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Processing event: ', event)

  // get Groups from DynamoDB table: 
  const groups = await getAllGroups()

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      items: groups
    })
  }
}