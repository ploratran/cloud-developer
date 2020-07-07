// Auth0 RS256 (Asymmetric) Algorithm: 
// No need to use middy() middleware as no need to use secret: 
import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

// import { verify and JwtToken } as of HS256: 
import { verify } from 'jsonwebtoken'
import { JwtToken } from '../../auth/JwtToken'

const certificate = ''; 

export const handler = async (event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> => {
    try {
        const jwtToken = verifyToken(event.authorizationToken)
        console.log('User was authorized', jwtToken)
        
        return {
            // return IAM policy: 
            principalId: jwtToken.sub, // return userID from JWT token // sub is ID of user passed with Auth 0
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
}

const verifyToken = (authHeader: string): JwtToken => {
    if (!authHeader) {
        throw new Error('No authentication header')
    }

    if (!authHeader.toLocaleLowerCase().startsWith('bearer ')) {
        throw new Error('Invalid authentication header')
    }

    const split = authHeader.split(' ')
    const token = split[1]

    // no need to store secret as of HS256 => no need AWS Secret Manager or middy()
    // verify with Auth0 certificate 
    return verify(
        token, // token from HTTP header to validate
        certificate, // a certificate copied from Auth0 website
        { algorithm: ['RS256'] } // specify that we use the RS256 algorithm 
    ) as JwtToken
}