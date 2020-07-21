import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { updateTodoItem } from '../../businessLogic/todoLogic'
import { createLogger } from '../../utils/logger'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

const logger = createLogger('Update Todo');

export const handler = middy(
    async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

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
        body: 'Sucessfully updated!'
    }
});

handler.use(
    cors({ credentials: true})
)