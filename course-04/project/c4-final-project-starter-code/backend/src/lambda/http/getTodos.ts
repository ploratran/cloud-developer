import 'source-map-support/register'
import { createLogger } from '../../utils/logger'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { getTodoList } from '../../businessLogic/todoLogic'

const logger = createLogger('auth');

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // TODO: Get all TODO items for a current user
    logger.info('Get all todo from list');

    // get jwtToken from event headers:
    const authorization = event.headers.Authorization
    const split = authorization.split(' ')
    const jwtToken = split[1]

    // pass in jwtToken to getTodoList
    // so todolist fetch will be based on userId
    const todoList = await getTodoList(jwtToken)

    return {
        statusCode: 200, 
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true
        }, 
        body: JSON.stringify({
            items: todoList
        })
    }
}
