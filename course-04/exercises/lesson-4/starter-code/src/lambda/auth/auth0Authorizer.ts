// Authorize Auth0

import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { secretsManager } from 'middy/middlewares' // lambda middleware for read and cache secret from AWS Secret Manager

import { verify } from 'jsonwebtoken' // built-in method to verify JSON Web Token
import { JwtToken } from '../../auth/JwtToken'

const secretId = process.env.AUTH_0_SECRET_ID
const secretField = process.env.AUTH_0_SECRET_FIELD

// use middy middleware for handler
// pass code logic to middy() 
// context: for middy() to store secret in this context
export const handler = middy(async (event: CustomAuthorizerEvent, context): Promise<CustomAuthorizerResult> => {
  try {
    const decodedToken = verifyToken(
      event.authorizationToken,
      context.AUTH0_SECRET[secretField] // read secret field in context passed to middy parameter
    )
    console.log('User was authorized', decodedToken)

    return {
      // return IAM policy: 
      principalId: decodedToken.sub, // return userID from JWT token // sub is ID of user passed with Auth 0
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    console.log('User was not authorized', e.message)

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
})

function verifyToken(authHeader: string, secret: string): JwtToken {
  if (!authHeader)
    throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return verify(token, secret) as JwtToken
}

// use secretsManager middleware
handler.use(
  secretsManager({
    cache: true, // cache result of secret value
    cacheExpiryInMillis: 60000, // expired time of cache
    // Throw an error if can't read the secret
    throwOnFailedCall: true, // if faile to fetch secret => fail to invoke hanlder
    secrets: { 
      AUTH0_SECRET: secretId // specified secret to be fetched => secret id in Auth0
    }
  })
)
