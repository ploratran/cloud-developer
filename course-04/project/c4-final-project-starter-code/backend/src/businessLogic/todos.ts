import * as uuid from 'uuid'
import { TodoAccess } from '../dataLayer/todosAccess'
import { createLogger } from '../utils/logger'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { TodoItem } from '../models/TodoItem'

const logger = createLogger('auth')

// initialize new object from TodoAccess class: 
const todoAccess = new TodoAccess()

// create todo with corresponding userId: 
export async function createTodo(
    createTodoRequest: CreateTodoRequest,
    userId: string
): Promise<TodoItem> {
    logger.info(`Create Todo for user ${userId}`)

    // generate unique item id: 
    const itemId = uuid.v4()

    return await todoAccess.createTodo({
        todoId: itemId,
        createdAt: new Date().toISOString(),
        done: false,
        ...createTodoRequest,
        userId, 
    })
}
