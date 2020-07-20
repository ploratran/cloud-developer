import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { createLogger } from '../../utils/logger'
import { deleteTodoItem } from '../../businessLogic/todoLogic'

const logger = createLogger('Delete Todo');

// delete based on todoId with valid userId
export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

    // get todoId from event path parameter: 
    const todoId = event.pathParameters.todoId

    // get jwt token for userId: 
    const authorization = event.headers.Authorization
    const split = authorization.split(' ')
    const jwtToken = split[1]

    // TODO: Remove a TODO item by id
    await deleteTodoItem(jwtToken, todoId); 

    logger.info(`Successfully delete todo item ${todoId}`)

    return {
        statusCode: 200, 
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true
        },
        body: ''
    }
}
