import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify, decode } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger' // winston logger
import axios, { AxiosRequestConfig } from 'axios'
import { Jwt } from '../../auth/Jwt' // interface of JWT
import { JwtPayload } from '../../auth/JwtPayload' // return type of verified token

const logger = createLogger('auth')

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
const jwksUrl = 'https://dev-a6-tsbmc.us.auth0.com/.well-known/jwks.json' // JWKS endpoint

export const handler = async (event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)

  try {
    // verified passed in token from event authorization
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
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
    logger.error('User not authorized', { error: e.message })

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

// verify using RS256 algorithm and JWKS endpoint
// allow application to trust JWT signed by Auth0 
async function verifyToken(authHeader: string): Promise<JwtPayload> {
  // get JWT token from Request Authorization Header: 
  const token = getToken(authHeader)
  // decode JWT token:
  const jwt: Jwt = decode(token, { complete: true }) as Jwt

  // TODO: Implement token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/
  const jwks = await axios.get(jwksUrl)

  // // try to log jwks metadata: 
  logger.info('Get jwks : ' + jwks); 
  console.log(jwks);

  // // JSON Web Key Set Properties: https://auth0.com/docs/tokens/references/jwks-properties
  // // get the x5c: x509 certificate chain use for token verification
  const x5c = jwks['data']['keys'][0]['x5c'][0]
  const certificate = `-----BEGIN CERTIFICATE-----\n${x5c}\n-----END CERTIFICATE-----`

  // /**
  //  * @params: decode JWT token payload
  //  * @params: secret or certificate or private key
  //  * @params: option(algorithm type) or callback
  //  */
  return verify(jwt.payload.iss, certificate, { algorithms: ['RS256'] }) as JwtPayload
}

// get jwtToken after the word 'Bearer '
// @return token
function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
