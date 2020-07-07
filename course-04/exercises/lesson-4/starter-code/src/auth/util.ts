import { JwtToken } from './JwtToken'
import { decode } from 'jsonwebtoken' // parse JWT token and return its payload

/**
 * Parse a JWT token and return a user id
 * @param jwtToken JWT Token to parse
 * @param a user id from the JWT token
 */

export function getUserId(jwtToken: string): string {
    const decodedJwt = decode(jwtToken) as JwtToken; 
    return decodedJwt.sub; // sub is Id of user passed with Auth0
}