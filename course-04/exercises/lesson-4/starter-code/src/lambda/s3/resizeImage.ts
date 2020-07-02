import { SNSEvent, SNSHandler, S3EventRecord } from 'aws-lambda'
import 'source-map-support/register'
import * as AWS from 'aws-sdk'
import Jimp from 'jimp/es'

const s3 = new AWS.S3()

const imagesBucketName = process.env.IMAGES_S3_BUCKET
const thumbnailBucketName = process.env.THUMBNAILS_S3_BUCKET

export const handler: SNSHandler = async (event: SNSEvent) => {
    console.log('Processing SNS event ', JSON.stringify(event))

    for (const snsRecord of event.Records) {
        const s3EventStr = snsRecord.Sns.Message;
        console.log('Processing S3 event ', s3EventStr);

        const s3Event = JSON.parse(s3EventStr); 

        // loop thru records in S3Event Records
        for (const record of s3Event.Records) {
            await processImage(record); // function that resize image
        }
    }
}

// function that resize each iamge: 
async function processImage(record: S3EventRecord) {
    // get key of object for every record 
    //(newly uploaded images) added to S3 bucket:  
    const key = record.s3.object.key; 

    // use the key from new S3 object and dowload it: 
    const response = await s3.getObject({
        Bucket: imagesBucketName,
        Key: key
    }).promise()

    // body contains the downloaded object of type Buffer: 
    // Type Buffer: work with an array of bytes
    const body: Buffer = response.Body;

    // resize image using JIMP: 
    const image = await Jimp.read(body); 

    // resize image with ration maintained between width and height:
    image.resize(150, Jimp.AUTO); 

    // convert image to buffer that can write to different bucket: 
    const convertedBuffer = await image.getBufferAsync(Jimp.AUTO); 

    console.log(`Writing image to new ${thumbnailBucketName} S3 bucket:`); 

    await s3.putObject({
        Bucket: thumbnailBucketName,
        Key: `${key}.jpeg`,
        Body: convertedBuffer
    }).promise()
}