import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic
export class TodosAccess {
  constructor(
    private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
    private readonly todosTable = process.env.TODOS_TABLE,
    private readonly todosIndex = process.env.TODOS_CREATED_AT_INDEX
  ) {}

  getAllTodos = async (userId: string): Promise<TodoItem[]> => {
    logger.info(`Get all todos of user ${userId}`)

    const result = await this.docClient
      .query({
        TableName: this.todosTable,
        IndexName: this.todosIndex,
        KeyConditionExpression: 'userId = :id',
        ExpressionAttributeValues: {
          ':id': userId
        },
        ScanIndexForward: false
      })
      .promise()

    return result.Items as TodoItem[]
  }

  createTodo = async (todoItem: TodoItem): Promise<TodoItem> => {
    logger.info(`Create todo`, todoItem)

    await this.docClient
      .put({
        TableName: this.todosTable,
        Item: todoItem
      })
      .promise()

    return todoItem
  }

  getTodo = async (userId: string, todoId: string): Promise<TodoItem> => {
    logger.info(`Get todo: ${todoId} of user: ${userId}`)

    const result = await this.docClient
      .get({
        TableName: this.todosTable,
        Key: {
          userId: userId,
          todoId: todoId
        }
      })
      .promise()

    logger.info(`got result ${result.Item}`)

    return result.Item as TodoItem
  }

  updateTodo = async (
    userId: string,
    todoId: string,
    todoUpdate: TodoUpdate
  ) => {
    logger.info(`Update todo ${todoId} of user ${userId}`)

    const result = await this.docClient
      .update({
        TableName: this.todosTable,
        Key: {
          userId: userId,
          todoId: todoId
        },
        UpdateExpression: 'set #name = :name, dueDate = :dueDate, done = :done',
        ExpressionAttributeNames: {
          '#name': 'name'
        },
        ExpressionAttributeValues: {
          ':name': todoUpdate.name,
          ':dueDate': todoUpdate.dueDate,
          ':done': todoUpdate.done
        }
      })
      .promise()

    logger.info(`Update result: ${result}`)
  }

  deleteTodo = async (userId: string, todoId: string) => {
    logger.info(`deleting todo ${todoId} of user ${userId}`)

    await this.docClient
      .delete({
        TableName: this.todosTable,
        Key: {
          userId: userId,
          todoId: todoId
        }
      })
      .promise()
  }

  updateAttachmentUrl = async (userId: string, todoId: string, url: string) => {
    logger.info(`Update todo ${todoId}, attachment ${url}`)

    const result = await this.docClient
      .update({
        TableName: this.todosTable,
        Key: {
          userId: userId,
          todoId: todoId
        },
        ExpressionAttributeNames: {
          '#todo_attachmentUrl': 'attachmentUrl'
        },
        ExpressionAttributeValues: {
          ':attachmentUrl': url
        },
        UpdateExpression: 'SET #todo_attachmentUrl = :attachmentUrl',
        ReturnValues: 'ALL_NEW'
      })
      .promise()

    logger.info(`Updated todo ${todoId}, attachment ${url}, result: ${result}`)
  }
}
