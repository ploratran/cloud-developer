'use strict'; 

const AWS = require('aws-sdk'); 

const docClient = new AWS.DynamoDB.DocumentClient(); 

const groupsTable = process.env.GROUPS_TABLE; 

exports.handler = async (event) => {
    
    // define params limit and nextKey; 
    let limit, nextKey; 
    
    // get limit and nextKey params from event using helper functions
    // check if error return 400 statusCode
    try {
        limit = getLimitParameter(event) || 2; // set default limit as 2
        nextKey = getNextKeyParameter(event); 
    } catch (e) {
        return {
            statusCode: 400, 
            headers: {
                'Access-Control-Allow-Origin': '*'
            }, 
            body: JSON.stringify({msg: 'Invalid parameters'})
        }
    };
    
    // get items from Groups table in DynamoDB: 
    const result = await docClient.scan({
        TableName: groupsTable, 
        Limit: limit, 
        // ExclusiveStartKey: nextKey 
        ExclusiveStartKey: nextKey,
    }).promise(); 
    
    const items = result.Items;
    
    const startKey = result.LastEvaluatedKey;
     
    // return result to client: 
    const response = {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*'
        }, 
        body: JSON.stringify({ 
            items, 
            nextKey: encodeNextKey(startKey), 
        })
    };
    
    return response;
};

// HELPER FUNCTIONS //

// get query string parameters from HTTP event object based on name param:
const getQueryParameters = (event, name) => {
    const eventQuery = event.queryStringParameters; 
    
    // check queryStringParameters if undefined: 
    if (!eventQuery) { return undefined; }
    
    return eventQuery[name]; 
}; 

// get limit string query parameter: 
const getLimitParameter = event => {
    // get limit string from HTTP event object from query parameter 
    const limitStr = getQueryParameters(event, 'limit'); 
    
     // check queryStringParameters if undefined: 
    if (!limitStr) {
        return undefined; 
    }
    
    const limit = parseInt(limitStr, 10); // base 10
    
    // check if limit is negative => throw error
    if (limit <= 0) {
        throw new Error('Limit should be positive');
    }
    
    return limit; 
}; 

// get nextKey string parameter from HTTP event object: 
const getNextKeyParameter = event => {
    // get nextKey string from HTTP event object from query parameter
    const nextKeyStr = getQueryParameters(event, 'nextKey'); 
    if (!nextKeyStr) {
        return undefined; 
    }
    
    // decode nextKey string and 
    // parse JSON string into a JSON object in order to pass into GET request
    // @return {String}
    // console.log('NextKey ' + JSON.parse(decodeURIComponent(nextKeyStr))); 
    return JSON.parse(decodeURIComponent(nextKeyStr)); 
}

// LastEvaluatedKey is a object from DynamoDB
// convert the LastEvaluatedKey from a JSON object to a string
// then encode it to URI in order to pass it in a URL
const encodeNextKey = lastEvaluatedKey => {
  // 
  if (!lastEvaluatedKey) {
      // if null, means no more items to return: 
      return null; 
  } 
   
  // return a string as a URI encoded of LastEvaluatedKey
  // @return {String} 
  // console.log('lastEvaluatedKey ' + encodeURIComponent(JSON.stringify(lastEvaluatedKey))); 
  return encodeURIComponent(JSON.stringify(lastEvaluatedKey)); 
}; 