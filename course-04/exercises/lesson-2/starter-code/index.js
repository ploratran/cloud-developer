'use strict'

const AWS = require('aws-sdk')

const docClient = new AWS.DynamoDB.DocumentClient()

const groupsTable = process.env.GROUPS_TABLE

exports.handler = async (event) => {
  console.log('Processing event: ', event)

  // TODO: Read and parse "limit" and "nextKey" parameters from query parameters
  // let nextKey // Next key to continue scan operation if necessary
  let nextKey; 
  // let limit // Maximum number of elements to return
  let limit; 

  // HINT: You might find the following method useful to get an incoming parameter value
  // getQueryParameter(event, 'param')

  // TODO: Return 400 error if parameters are invalid
  try {
    limit = parseLimitParameter(event); 
    nextKey = parseNextKeyParameter(event); 
  } catch (e) {
    console.log('Error try to parse query paramemters');
    return {
      statusCode: 400, 
      headers: {
        'Access-Control-Allow-Origin': '*'
      }, 
      body: JSON.stringify({error: 'Invalid parameters'})
    } 
  }

  // Scan operation parameters
  const scanParams = {
    TableName: groupsTable,
    // TODO: Set correct pagination parameters
    Limit: limit,
    ExclusiveStartKey: nextKey
  }
  console.log('Scan params: ', scanParams)

  const result = await docClient.scan(scanParams).promise()

  const items = result.Items

  console.log('Result: ', result)

  // Return result
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      items,
      // Encode the JSON object so a client can return it in a URL as is
      nextKey: encodeNextKey(result.LastEvaluatedKey)
    })
  }
}

// HELPER FUNCTIONS //

/*
@params {String} event.queryStringParameters.limit 
parseInt() event.queryStringParameters.limit into number
check if limitString is undefined or not
return {Number} limit
*/
function parseLimitParameter(event) {
  const limitStr = getQueryParameter(event, 'limit'); 
  if (!limitStr) {
    return undefined; 
  }

  // parse String to Int
  const limit = parseInt(limitStr, 10);
  
  // check for positive number 
  if (limit <= 0) {
    throw new Error('Limit should be positive'); 
  }

  return limit; 
}

/*
@params {String} event.queryStringParameters.nextKey
check if nextKey is undefined or not
*/
function parseNextKeyParameter(event) {
  const nextKeyStr = getQueryParameter(event, 'nextKey');  
  if (!nextKeyStr) {
    return undefined; 
  }

  // to pass a value coming in a GET request you would need to 
  // first decode a string and then parse a JSON string
  // "exclusiveStartKey" can be passed a parameter to a "scan()" call
const exclusiveStartKey = JSON.parse(decodeURIComponent(nextKeyStr));
return exclusiveStartKey; 
}

/**
 * Get a query parameter or return "undefined"
 *
 * @param {Object} event HTTP event passed to a Lambda function
 * @param {string} name a name of a query parameter to return
 *
 * @returns {string} a value of a query parameter value or "undefined" if a parameter is not defined
 */
function getQueryParameter(event, name) {
  const queryParams = event.queryStringParameters
  // Check if queryStringParameters is undefined: 
  if (!queryParams) {
    return undefined
  }

  return queryParams[name]
}

/**
 * Encode last evaluated key using
 *
 * @param {Object} lastEvaluatedKey a JS object that represents last evaluated key
 *
 * @return {string} URI encoded last evaluated key
 */
function encodeNextKey(lastEvaluatedKey) {
  if (!lastEvaluatedKey) {
    return null
  }

  // the value of the LastEvaluatedKey in a DynamoDB result is a JSON object
  // convert it to a string and then use URI encoding to allow to pass it in a URL:
  return encodeURIComponent(JSON.stringify(lastEvaluatedKey))
}
