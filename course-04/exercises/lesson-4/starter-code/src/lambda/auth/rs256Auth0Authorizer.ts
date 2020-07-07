// Auth0 RS256 (Asymmetric) Algorithm: 
// No need to use middy() middleware as no need to use secret: 
import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

// import { verify and JwtToken } as of HS256: 
import { verify } from 'jsonwebtoken'
import { JwtToken } from '../../auth/JwtToken'

const certificate = `MIIDDTCCAfWgAwIBAgIJTspaC7dGTAx+MA0GCSqGSIb3DQEBCwUAMCQxIjAgBgNV
BAMTGWRldi1lNWdtM2xnNC51cy5hdXRoMC5jb20wHhcNMjAwNzA1MTg1NjEzWhcN
MzQwMzE0MTg1NjEzWjAkMSIwIAYDVQQDExlkZXYtZTVnbTNsZzQudXMuYXV0aDAu
Y29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEArwLXHr2DbzBsoO+r
FqJkyR65EYlA2h4CvJmJraxqZYFLykR1mYbJStcOgSPavgPUQtrKZJ9mI7Zf8WmH
ILkNs7qd+AzkdgkTK1zIxe8fidq1PkKCfiCnDLonXZAoCXSjX2u20w+2sJ83327I
W+kpuMRe6oF9rG0v16r8a2fhRKt81RdwBJPVVOpxKhd+BZ4WsSp/14JGhIhO0cUE
lH0PDDAOXFvDFZhjRljTeDT++pUa61NyN+dxNCuxE8eKBE1Gto2CSY4Pq7t2hBhd
vZlaJp8s5Apnt8ifHV9a50x3jkHKF+7UiUBqM/QishZgeq527f9R+FPsBWmrCrw+
OszanQIDAQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBTN5NFGxq/L
Yja23242jgUDErkjCTAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEB
AENlf0aslphBLtRKBLn5+Y02Q9pVtBFJ+bzMlcv1ChnZVwRsCrQUrj/XXeWag6tl
TSdgzf8EIWKeUgm5NQr7WH/kGbVX2vnzb/lVOs8E59syj3v2iYTweGTGojCyBS8q
3cXuGyxXzV/UkwWbxZLNFUjrxA4NSAr7NTN+DIk7r2yyWciiwuLqyPkJiEsWvJkF
JgBwxSLB4BWc4RyYd6u9Hg1wXzsrZNwTBemmns3dvh4X071k3JTnlg/Xxv/LT2Hb
eDmgYhtli0t3oPROnf2YAbKBEnWqvu7Udx9t/rwKqjmjKGrk9PEaRpr9txoHCR3D
vAGKLf9PcfdGo9i9vPdHFTI=`;

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