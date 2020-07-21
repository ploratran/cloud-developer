import * as uuid from 'uuid'
import { TodoLayer } from '../dataLayer/todoLayer'
import { createLogger } from '../utils/logger'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { TodoItem } from '../models/TodoItem'
import { parseUserId } from '../auth/utils' // get userId from jwt token
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

const logger = createLogger('auth')

// initialize new object from TodoAccess class: 
const todoLayer = new TodoLayer()

// find todo list by userId from JwtToken
export async function getTodoList(jwtToken: string): Promise<TodoItem[]> {
    logger.info('get Todo List in Business Logic')
    const userId = parseUserId(jwtToken); 
    return todoLayer.getTodos(userId);
}

// create todo with corresponding userId: 
export async function createTodo(
    newTodo: CreateTodoRequest, 
    jwtToken: string
): Promise<TodoItem> {

    logger.info(`Insert New Todo item`);

    const itemId = uuid.v4() // generate unique todo id: 
    const userId = parseUserId(jwtToken) // return userId

    logger.info(`Create Todo for user ${userId}`)

    return await todoLayer.createTodo({
        userId, 
        todoId: itemId,
        createdAt: new Date().toISOString(),
        done: false,
        ...newTodo, // name and dueDate
    }) as TodoItem
}

// update todo Item with userId and todoId: 
export async function updateTodoItem(
    jwtToken: string, 
    todoId: string,
    updateTodoItem: UpdateTodoRequest,
) {
    await todoLayer.updateTodo(parseUserId(jwtToken), todoId, updateTodoItem);
}

// delete todo item with userId and todoId:
export async function deleteTodoItem(
    jwtToken: string,
    todoId: string,
) {
    await todoLayer.deleteTodo(parseUserId(jwtToken), todoId);
}
