// interface that define structure of data stored in DynamoDB table: 
export interface Group {
  id: string
  name: string
  description: string
  userId: string
  timestamp: string
}
