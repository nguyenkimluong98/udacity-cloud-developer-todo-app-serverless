import { TodosAccess } from '../helpers/todosAcess'
import { AttachmentUtils } from '../helpers/attachmentUtils'
import * as TodosHelper from '../helpers/todos'
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import { TodoUpdate } from '../models/TodoUpdate'

const logger = createLogger('TodosLogic')
const todosAccess = new TodosAccess()
const attachmentUtils = new AttachmentUtils()

// TODO: Implement businessLogic
export const createTodo = async (
  userId: string,
  createTodoRequest: CreateTodoRequest
): Promise<TodoItem> => {
  const todoId = uuid.v4()

  const todoItem: TodoItem = {
    userId,
    todoId,
    createdAt: new Date().toISOString(),
    name: createTodoRequest.name,
    dueDate: createTodoRequest.dueDate,
    done: false
  }

  logger.info(`Create todo with info:`, { todoItem })

  await todosAccess.createTodo(todoItem)
  return todoItem
}

export const getTodos = async (userId: string): Promise<TodoItem[]> => {
  logger.info(`Get all todos of user ${userId}`)

  return await todosAccess.getAllTodos(userId)
}

export async function deleteTodo(userId: string, todoId: string) {
  logger.info(`Delete todo ${todoId} by user: ${userId}`)

  await validateUserAuth(userId, todoId)

  await todosAccess.deleteTodo(userId, todoId)
}

export const updateTodo = async (
  userId: string,
  todoId: string,
  todoUpdate: UpdateTodoRequest
) => {
  logger.info(`User ${userId} updating todo ${todoId} with new info:`, {
    todoUpdate
  })
  // valida user
  await TodosHelper.validateUserAuth(userId, todoId)

  return await todosAccess.updateTodo(userId, todoId, todoUpdate as TodoUpdate)
}

export const getUploadAttachmentUrl = async (
  userId: string,
  todoId: string
): Promise<string> => {
  logger.info(
    `Generating attachment URL for todo: ${todoId} by user: ${userId}`
  )

  await TodosHelper.validateUserAuth(userId, todoId)

  const attachmentUrl = attachmentUtils.getAttachmentUrl(todoId)
  logger.info(`AttachmentUrl for upload : ${attachmentUrl}`)

  await todosAccess.updateAttachmentUrl(userId, todoId, attachmentUrl)

  const uploadUrl = await attachmentUtils.getUploadUrl(todoId)
  logger.info(`AttachmentUrl: ${uploadUrl}`)

  return uploadUrl
}

const validateUserAuth = async (userId: string, todoId: string) => {
  const todo = await todosAccess.getTodo(userId, todoId)

  if (!todo) throw new Error(`Todo ${todoId} not found`)

  if (todo.userId !== userId) {
    logger.warn(`Todo ${todoId} not belong to User ${userId}!`)
    throw new Error(`User ${userId} not authorized to modify todo ${todoId}`)
  }

  logger.info(`Validated user ${userId} has todo ${todoId}`)
}
