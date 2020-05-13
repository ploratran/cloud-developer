export const config = {
  "postgress": {
    "username": process.env.POSTGRESS_USERNAME,
    "password": process.env.POSTGRESS_PASSWORD,
    "database": process.env.POSTGRESS_DATABASE,
    "host": process.env.POSTGRESS_HOST,
    "dialect": "postgress",
  }, 
  "aws": {
    "aws_region": process.env.AWS_REGION,
    "aws_profile": process.env.AWS_PROFILE,
    "aws_media_bucket": "udagram-plora-s3",
  },
  "jwt": {
    "secret": process.env.JWT_SECRET,
  }
};

// export const config = {
//   "dev": {
//     "username": "udacityploradev",
//     "password": "mimimama0129",
//     "database": "udagramploradev",
//     "host": "udacityploradb.c4mzfucs0jq6.us-east-2.rds.amazonaws.com",
//     "dialect": "postgres",
//     "aws_region": "us-east-2",
//     "aws_profile": "default",
//     "aws_media_bucket": "udagram-plora-s3"
//   },
//   "prod": {
//     "username": "udacityploradev",
//     "password": "mimimama0129",
//     "database": "udagramploradev",
//     "host": "udacityploradb.c4mzfucs0jq6.us-east-2.rds.amazonaws.com",
//     "dialect": "postgres"
//   }
// }
