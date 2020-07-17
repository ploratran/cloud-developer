/**
 * A payload of a JWT token
 */
export interface JwtPayload {
  iss: string // issuer
  sub: string // subject
  iat: number // issued at
  exp: number // expiration time
}
