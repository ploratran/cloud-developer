
import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify } from 'jsonwebtoken'
import { JwtToken } from '../../auth/JwtToken'

const cert = `-----BEGIN CERTIFICATE-----
MIIDDTCCAfWgAwIBAgIJWIxzOwNUav7iMA0GCSqGSIb3DQEBCwUAMCQxIjAgBgNV
BAMTGWRldi1hNi10c2JtYy51cy5hdXRoMC5jb20wHhcNMjAwNzE2MDIyODUzWhcN
MzQwMzI1MDIyODUzWjAkMSIwIAYDVQQDExlkZXYtYTYtdHNibWMudXMuYXV0aDAu
Y29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA0yPNZLqYupXWQagG
DtpBKRjknCmMi9ECOG64A8BNBqeIIvhtLAQ0rTcwKmGYdUI1z0SgDlj/UVXa8DCv
j3JftgremaEXoFXqqPK7sXpVwctI4Fh8WzHIuVCzLFS+y17T9DD+14AjOE2ZhhS0
rqwS5AjwyEWltlrX5+9oa8x81b6pnO45mXCrNOz+XgSd1hqFTCcRbL7wtRa9gzpD
m8opYf826odrbrF3PuCVmMZuNgjxOmE4XN9fXkePyop8UbhhTo9TfbYB1rI+2hdR
M58s4lhg0KfzHVhef8rYJWECwnSCDq0XrcL9cZa4zLYAQgx0jNsiSBWQ8LhrjEDr
3cCGUwIDAQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBQ7sRgM4Z72
0pJMjbaB9XKfzKiErjAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEB
AIs9He+13sYRBrW+4zBAxxLIRE5yWbCvaVSPwwB7oYz80cL+IBCWMfvmoN6pSaAH
sdqF548XApPmdbSjPsjU+RWl1HWjAVoGr7XTh5FrkbUa/9IoygQEzTz+0a4mSmSm
cFZlQIJRsljZG7NFKxcb5sJk55A7yEVXOH+I4eRPjBu+9+ZJ1a8Z2w9fHxoMwnZI
FjOnk3px0bXYgEKlsc7FPPz0trp/CSmSVO9pILEdhE4dvJSe6nNhQySRYkeO56ht
x8clEmr7x4N1uW1BiaWmOJvOuCRqqEysR8HRE5quvZwbAUF+mXEAlyNgaGsrnzAC
5e33jkYMLGAI3gBaPEb8YE8=
-----END CERTIFICATE-----`

export const handler = async (event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> => {
  try {
    const jwtToken = verifyToken(event.authorizationToken)
    console.log('User was authorized', jwtToken)

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
    console.log('User authorized', e.message)

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

function verifyToken(authHeader: string): JwtToken {
  if (!authHeader)
    throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return verify(token, cert, { algorithms: ['RS256'] }) as JwtToken
}
