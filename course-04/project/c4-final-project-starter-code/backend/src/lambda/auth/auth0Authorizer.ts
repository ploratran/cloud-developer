import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger' // winston logger
import axios from 'axios'
// import { Jwt } from '../../auth/Jwt' // interface of JWT
import { JwtPayload } from '../../auth/JwtPayload' // return type of verified token

const logger = createLogger('auth')

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
const jwksUrl = 'https://dev-a6-tsbmc.us.auth0.com/.well-known/jwks.json' // JWKS endpoint

// const certificate = `-----BEGIN CERTIFICATE-----
// MIIDDTCCAfWgAwIBAgIJWIxzOwNUav7iMA0GCSqGSIb3DQEBCwUAMCQxIjAgBgNV
// BAMTGWRldi1hNi10c2JtYy51cy5hdXRoMC5jb20wHhcNMjAwNzE2MDIyODUzWhcN
// MzQwMzI1MDIyODUzWjAkMSIwIAYDVQQDExlkZXYtYTYtdHNibWMudXMuYXV0aDAu
// Y29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA0yPNZLqYupXWQagG
// DtpBKRjknCmMi9ECOG64A8BNBqeIIvhtLAQ0rTcwKmGYdUI1z0SgDlj/UVXa8DCv
// j3JftgremaEXoFXqqPK7sXpVwctI4Fh8WzHIuVCzLFS+y17T9DD+14AjOE2ZhhS0
// rqwS5AjwyEWltlrX5+9oa8x81b6pnO45mXCrNOz+XgSd1hqFTCcRbL7wtRa9gzpD
// m8opYf826odrbrF3PuCVmMZuNgjxOmE4XN9fXkePyop8UbhhTo9TfbYB1rI+2hdR
// M58s4lhg0KfzHVhef8rYJWECwnSCDq0XrcL9cZa4zLYAQgx0jNsiSBWQ8LhrjEDr
// 3cCGUwIDAQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBQ7sRgM4Z72
// 0pJMjbaB9XKfzKiErjAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEB
// AIs9He+13sYRBrW+4zBAxxLIRE5yWbCvaVSPwwB7oYz80cL+IBCWMfvmoN6pSaAH
// sdqF548XApPmdbSjPsjU+RWl1HWjAVoGr7XTh5FrkbUa/9IoygQEzTz+0a4mSmSm
// cFZlQIJRsljZG7NFKxcb5sJk55A7yEVXOH+I4eRPjBu+9+ZJ1a8Z2w9fHxoMwnZI
// FjOnk3px0bXYgEKlsc7FPPz0trp/CSmSVO9pILEdhE4dvJSe6nNhQySRYkeO56ht
// x8clEmr7x4N1uW1BiaWmOJvOuCRqqEysR8HRE5quvZwbAUF+mXEAlyNgaGsrnzAC
// 5e33jkYMLGAI3gBaPEb8YE8=
// -----END CERTIFICATE-----`

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
  // const jwt: Jwt = decode(token, { complete: true }) as Jwt

  // TODO: Implement token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/
  const jwks = await axios.get(jwksUrl)

  // try to log jwks metadata: 
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
  return verify(token, certificate, { algorithms: ['RS256'] }) as JwtPayload
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
