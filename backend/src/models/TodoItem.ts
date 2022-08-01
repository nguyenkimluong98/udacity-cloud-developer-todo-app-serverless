export interface TodoItem {
  userId: string
  todoId: string
  createdAt: string
  name: string
  dueDate: string
  description: string
  status: number
  attachmentUrl?: string
}
