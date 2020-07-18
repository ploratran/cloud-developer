import * as uuid from 'uuid'
import { TodoAccess } from '../dataLayer/todosAccess'
import { createLogger } from '../utils/logger'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { TodoItem } from '../models/TodoItem'
import { parseUserId } from '../auth/utils'

const logger = createLogger('auth')

// initialize new object from TodoAccess class: 
const todoAccess = new TodoAccess()

// create todo with corresponding userId: 
export async function createTodo(
    createTodoRequest: CreateTodoRequest,
    jwtToken: string
): Promise<TodoItem> {

    // generate unique item id: 
    const itemId = uuid.v4()
    const userId = parseUserId(jwtToken)

    logger.info(`Create Todo for user ${userId}`)

    return await todoAccess.createTodo({
        userId, 
        todoId: itemId,
        createdAt: new Date().toISOString(),
        done: false,
        ...createTodoRequest,
    })
}
