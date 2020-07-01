import { DynamoDBStreamEvent, DynamoDBStreamHandler } from 'aws-lambda'
import 'source-map-support/register'
import * as elasticsearch from 'elasticsearch'
import * as httpAwsEs from 'http-aws-es' // dependency to use es in aws


const esHost = process.env.ES_ENDPOINT // images-search-dev

// define ElasticSearch client to allow write to ElasticSearch: 
const es = new elasticsearch.Client({
  hosts: [ esHost ],
  connectionClass: httpAwsEs
})

// using DynamoDB Event and Handler to process ElasticSearch: 
export const handler: DynamoDBStreamHandler = async (event: DynamoDBStreamEvent) => {
  console.log('Processing events batch from DynamoDB', JSON.stringify(event))

  // loop thru all records in DynamoDB Stream Event: 
  for (const record of event.Records) {
    console.log('Processing record', JSON.stringify(record))
    if (record.eventName !== 'INSERT') {
      continue
    }

    // get DynamoDB item that's added to DynamoDB: 
    const newItem = record.dynamodb.NewImage

    // get image ID that's added to Images Table: 
    const imageId = newItem.imageId.S

    // create document that will store in ElasticSearch
    // derived from DynamoDB: 
    const body = {
      imageId: newItem.imageId.S,
      groupId: newItem.groupId.S,
      imageUrl: newItem.imageUrl.S,
      title: newItem.title.S,
      timestamp: newItem.timestamp.S
    }

    // store new item to ElasticSearch 
    await es.index({
      index: 'images-index', // index similar to Table in DynamoDB
      type: 'images', // type of index
      id: imageId, // document ID
      body
    })

  }
}
