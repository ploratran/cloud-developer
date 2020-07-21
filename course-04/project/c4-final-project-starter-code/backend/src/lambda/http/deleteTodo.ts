import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { createLogger } from '../../utils/logger'
import { deleteTodoItem } from '../../businessLogic/todoLogic'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

const logger = createLogger('Delete Todo');

// delete based on todoId with valid userId
export const handler = middy(
    async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

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
        body: 'Sucessfully deleted!'
    }
});

handler.use(
    cors({ credentials: true})
)
