import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { deleteTodo } from '../../businessLogic/todos'
import { getUserId } from '../utils'
import * as createError from 'http-errors'
import { createLogger } from '../../utils/logger'

const logger = createLogger('deleteTodo')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info(`Event info:`, { event })

    const todoId = event.pathParameters.todoId
    const userId = getUserId(event)

    try {
      await deleteTodo(userId, todoId)

      return {
        statusCode: 200,
        body: ''
      }
    } catch (e) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          error: createError(404, e.message)
        })
      }
    }
  }
)

handler.use(httpErrorHandler()).use(
  cors({
    credentials: true
  })
)
