import * as TodosAccess from './todosAcess'
import * as AttachmentUtils from './attachmentUtils'
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'

const logger = createLogger('TodosLogic')

// TODO: Implement businessLogic

export const validateUserAuth = async (userId: string, todoId: string) => {
  const todo = await TodosAccess.getTodo(userId, todoId)

  if (!todo) throw new Error(`Todo ${todoId} not found`)

  if (todo.userId !== userId) {
    logger.warn(`Todo ${todoId} not belong to User ${userId}!`)
    throw new Error(`User ${userId} not authorized to modify todo ${todoId}`)
  }

  logger.info(`Validated user ${userId} has todo ${todoId}`)
}
