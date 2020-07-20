import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { createLogger } from '../../utils/logger'
import * as AWS from 'aws-sdk'

const logger = createLogger('Generate URL');

logger.info('Upload Image')

// instantiate s3 from AWS-SDK: 
const s3 = new AWS.S3({
    signatureVersion: 'v4'
})

const s3bucket = process.env.TODOS_S3_BUCKET;
const s3expiredTime = process.env.SIGNED_URL_EXPIRATION;

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

    // get todoId from event's path parameter: 
    const todoId = event.pathParameters.todoId

    // TODO: Return a presigned URL to upload a file for a TODO item with the provided id

    // get the pre-signed url from S3 by todoId:
    const url = getUploadUrl(todoId);   

    return {
        statusCode: 200, 
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({
            uploadUrl: url, 
        })
    }
}

// get S3 pre-signed url of a todo item based on todoId: 
const getUploadUrl = (todoId: string) => {
    return s3.getSignedUrl('putObject', {
        Bucket: s3bucket,
        Key: todoId, 
        Expires: +s3expiredTime // typecast as number
    })
}