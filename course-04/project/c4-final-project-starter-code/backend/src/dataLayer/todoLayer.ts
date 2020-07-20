import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk' // use AWS X-Ray SDK
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
import { createLogger } from '../utils/logger'

const XAWS = AWSXRay.captureAWS(AWS) // debug tool for distributed tracing

const logger = createLogger('Todo Data Layer')

export class TodoLayer {

    constructor(
      // document client work with DynamoDB locally: 
      private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
      // name of table to store /groups
      private readonly todosTable = process.env.TODOS_TABLE,
      private readonly indexTable = process.env.INDEX_TABLE
    ) {}

    // get todos list based on userId
    // todo list is an array so return TodoItem[]
    async getTodos(userId: string): Promise<TodoItem[]> {
        logger.info(`Fetching todo item from user ${userId}`);

        // use query() instead of scan(): 
        const result = await this.docClient.query({
            TableName: this.todosTable, // name of base table
            IndexName: this.indexTable, // query from Index table for faster retrival
            KeyConditionExpression: 'userId = :userId', 
            ExpressionAttributeValues: { ':userId': userId },
            ScanIndexForward: false // get result with latest todo on top
        }).promise()

        // return todos as array of objects
        const todos = result.Items;
        return todos as TodoItem[]
    }
    
    // insert new item into Todos talbe:
    // match with TodoItem model:  
    async createTodo(todo: TodoItem): Promise<TodoItem> {
        logger.info(`Save new ${todo.name} into ${this.todosTable}`)

        await this.docClient.put({
            TableName: this.todosTable,
            Item: todo
        }).promise()

        return todo as TodoItem
    }

    // update todo item based on userId and todoId with properties:
    // name, dueDate, done (TodoUpdate model)
    async updateTodo(userId: string, todoId: string, todoItem: TodoUpdate) {
        logger.info(`Update todo with name ${todoItem.name} of user ${userId}`);

        await this.docClient.update({
            TableName: this.todosTable, 
            // Update with key: 
            Key: {
                userId, 
                todoId, 
            }, 
            UpdateExpression: 
                'set #name = :name, #dueDate = :dueDate, #done = :done',
            ExpressionAttributeValues: {
                ':name': todoItem.name,
                ':dueDate': todoItem.dueDate, 
                ':done': todoItem.done
            }, 
            ExpressionAttributeNames: {
                '#name': 'name', 
                '#dueDate': 'dueDate', 
                '#done': 'done'
            }
        }).promise()
    }
}