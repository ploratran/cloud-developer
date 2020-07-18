// import * as uuid from 'uuid'
import { TodoLayer } from '../dataLayer/todoLayer'
import { createLogger } from '../utils/logger'
// import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { TodoItem } from '../models/TodoItem'
import { parseUserId } from '../auth/utils' // get userId from jwt token

const logger = createLogger('auth')

// initialize new object from TodoAccess class: 
const todoLayer = new TodoLayer()

// create todo with corresponding userId: 
// export async function createTodo(createTodoRequest: CreateTodoRequest, jwtToken: string): Promise<TodoItem> {

//     logger.info(`Insert New Todo item`);

//     const itemId = uuid.v4() // generate unique todo id: 
//     const userId = parseUserId(jwtToken) // return userId

//     logger.info(`Create Todo for user ${userId}`)

//     return await todoLayer.createTodo({
//         userId, 
//         todoId: itemId,
//         createdAt: new Date().toISOString(),
//         done: false,
//         ...createTodoRequest, // name and dueDate
//     })
// }

// find todo list by userId from JwtToken
export async function getTodoList(jwtToken: string): Promise<TodoItem[]> {
    logger.info('get Todo List in Business Logic')
    const userId = parseUserId(jwtToken); 
    return todoLayer.getTodos(userId);
}
