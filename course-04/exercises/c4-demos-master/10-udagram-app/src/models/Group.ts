export interface Group {
  id: string // partition key
  name: string
  description: string
  userId: string
  timestamp: string // sort key
}
