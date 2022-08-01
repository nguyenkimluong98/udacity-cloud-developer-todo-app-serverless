import { TodosAccess } from './todosAcess'
import { createLogger } from '../utils/logger'

const logger = createLogger('TodosLogic')
const todosAccess = new TodosAccess()

// TODO: Implement businessLogic

export const validateUserAuth = async (userId: string, todoId: string) => {
  const todo = await todosAccess.getTodo(userId, todoId)

  if (!todo) throw new Error(`Todo ${todoId} not found`)

  if (todo.userId !== userId) {
    logger.warn(`Todo ${todoId} not belong to User ${userId}!`)
    throw new Error(`User ${userId} not authorized to modify todo ${todoId}`)
  }

  logger.info(`Validated user ${userId} has todo ${todoId}`)
}
