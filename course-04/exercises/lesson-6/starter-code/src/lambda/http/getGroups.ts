// no interaction with DynamoDB directly: 
import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import { getAllGroups } from '../../businessLogic/groups';

// *** API GATEWAY APPROACH *** //

// handler to get all groups: 
export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Processing event: ', event)

  // get Groups from DynamoDB table: 
  const groups = await getAllGroups()

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      items: groups
    })
  }
}

// *** EXPRESS APPROACH *** //

// use Express with AWS Lambda: 
// import * as express from 'express';
// import * as awsServerlessExpress from 'aws-serverless-express'; 
// const cors = require('cors'); 

// // using Express with AWS Lambda instead of API Gateway approach: 
// const app = express(); 
// app.use(cors())

// app.get('/groups', async (req, res) => {
//   console.log(req); 
//   // get all groups
//   const groups = await getAllGroups()

//   // return a list of groups: 
//   res.status(200).json({
//     items: groups
//   })
// }) 

// // create Express server with AWS: 
// const server = awsServerlessExpress.createServer(app)
// // pass API Gateway events to Express Server: 
// exports.handler = (event, context) => { awsServerlessExpress.proxy(server, event, context) }

