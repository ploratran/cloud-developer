import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { updateTodoItem } from '../../businessLogic/todoLogic'
import { createLogger } from '../../utils/logger'

const logger = createLogger('Update Todo');

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

    // get todoId from request event: 
    const todoId = event.pathParameters.todoId
    // get updated information from request body: 
    const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)

    // TODO: Update a TODO item with the provided id using values in the "updatedTodo" object
    logger.info('Update Todo Item'); 

    // validate and get userId from jwtToken:
    const authorization = event.headers.Authorization
    const split = authorization.split(' ')
    const jwtToken = split[1]

    // update todo item from business logic layer: 
    await updateTodoItem(jwtToken, todoId, updatedTodo); 

    return {
        statusCode: 200, 
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true
        }, 
        body: ''
    }
}
