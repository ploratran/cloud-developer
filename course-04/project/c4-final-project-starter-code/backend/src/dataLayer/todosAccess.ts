import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk' // use AWS X-Ray SDK
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { TodoItem } from '../models/TodoItem'
import { createLogger } from '../utils/logger'

const XAWS = AWSXRay.captureAWS(AWS) // debug tool for distributed tracing

const logger = createLogger('auth')

export class TodoAccess {

    constructor(
      // document client work with DynamoDB locally: 
      private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
      // name of table to store /groups
      private readonly todosTable = process.env.TODOS_TABLE
    ) {}
    
    // insert new item into Todos talbe: 
    async createTodo(todo: TodoItem): Promise<TodoItem> {
        logger.info(`Save new ${todo.todoId} into ${this.todosTable}`)
        
        await this.docClient.put({
            TableName: this.todosTable,
            Item: todo
        }).promise()

        return todo
    }
}