// create a class for Groups that used in other files: 
// blueprint for Groups: 
import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk' // use AWS X-Ray SDK
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

// return SDK with same itnerface as AWS SDK
// but generate sub-segment that will be sent to AWS X-Ray
const XAWS = AWSXRay.captureAWS(AWS) // debug tool to keep track of user requests

import { Group } from '../models/Group'

export class GroupAccess {

  constructor(
    // document client work with DynamoDB locally: 
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    // name of table to store /groups
    private readonly groupsTable = process.env.GROUPS_TABLE
  ) {}

  // get all groups in Groups table: 
  async getAllGroups(): Promise<Group[]> {
    console.log('Getting all groups')

    const result = await this.docClient.scan({
      TableName: this.groupsTable
    }).promise()

    const items = result.Items
    return items as Group[]
  }

  // insert new item into Groups talbe: 
  async createGroup(group: Group): Promise<Group> {
    await this.docClient.put({
      TableName: this.groupsTable,
      Item: group
    }).promise()

    return group
  }
}

// create DynamoDB table locally - not using AWS DynamoDB in cloud:
function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    console.log('Creating a local DynamoDB instance')
    return new XAWS.DynamoDB.DocumentClient({ // use X-Ray SDK
    // return new AWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }
  // return new AWS.DynamoDB.DocumentClient()
  return new XAWS.DynamoDB.DocumentClient()
}
