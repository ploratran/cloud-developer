import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { createTodo } from '../../businessLogic/todoLogic'
import { createLogger } from '../../utils/logger'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

const logger = createLogger('Create Todo');

export const handler = middy(
    async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.log('Processing events: ', event); 

    // create a single todo item with name and due date properties:
    const newTodo: CreateTodoRequest = JSON.parse(event.body)

    // TODO: Implement creating a new TODO item
    const authorization = event.headers.Authorization
    const split = authorization.split(' ')
    const jwtToken = split[1]

    const newItem = await createTodo(newTodo, jwtToken)

    logger.info(`New Item ${newItem}`)

    return {
        statusCode: 201, 
        body: JSON.stringify({
            item: newItem,
        })
    }
});

handler.use(
    cors({ credentials: true})
)