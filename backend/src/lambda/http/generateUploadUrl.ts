import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { getUploadAttachmentUrl } from '../../businessLogic/todos'
import { getUserId } from '../utils'
import * as createError from 'http-errors'
import { createLogger } from '../../utils/logger'

const logger = createLogger('getTodoAttachmentUrl')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info(`Event info:`, { event })

    const todoId = event.pathParameters.todoId
    // TODO: Return a presigned URL to upload a file for a TODO item with the provided id

    const userId = getUserId(event)

    try {
      const uploadUrl = await getUploadAttachmentUrl(userId, todoId)

      return {
        statusCode: 201,
        body: JSON.stringify({
          uploadUrl
        })
      }
    } catch (e) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          error: createError(404, e.message)
        })
      }
    }

    return undefined
  }
)

handler.use(httpErrorHandler()).use(
  cors({
    credentials: true
  })
)
