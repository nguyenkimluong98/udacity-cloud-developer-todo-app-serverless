export interface Todo {
  todoId: string
  createdAt: string
  name: string
  description: string
  dueDate: string
  status: number
  attachmentUrl?: string
}
