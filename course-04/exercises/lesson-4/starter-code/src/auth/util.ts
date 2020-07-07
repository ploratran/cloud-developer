import { decode } from 'jsonwebtoken'
import { JwtToken } from './JwtToken'

/**
 * Parse a JWT token and return a user id
 * @param jwtToken JWT Token to parse
 * @param a user id from the JWT token
 */

export function getUserId(jwtToken: string): string {
    return ''; 
}