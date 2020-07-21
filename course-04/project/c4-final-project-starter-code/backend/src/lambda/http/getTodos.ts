import 'source-map-support/register'
import { createLogger } from '../../utils/logger'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { getTodoList } from '../../businessLogic/todoLogic'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

const logger = createLogger('Get Todo');

export const handler = middy(
    async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // TODO: Get all TODO items for a current user
    logger.info('Get all todo from list');

    // get jwtToken from event headers:
    const authorization = event.headers.Authorization
    const split = authorization.split(' ')
    const jwtToken = split[1]

    // pass in jwtToken to getTodoList
    // so todolist fetch will be based on userId
    const todoList = await getTodoList(jwtToken); 

    logger.info(`List of item: ${todoList}`);

    return {
        statusCode: 200,
        body: JSON.stringify({
            items: todoList
        })
    }
});

handler.use(
    cors({ credentials: true})
)
