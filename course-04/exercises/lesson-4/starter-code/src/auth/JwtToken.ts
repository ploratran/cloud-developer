// interface for JWT token
// help Typescript compiler for type casting 
export interface JwtToken {
  iss: string
  sub: string
  iat: number
  exp: number
}
