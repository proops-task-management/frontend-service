import apiClient from './client'

export type TaskStatus = 'todo' | 'in_progress' | 'done'

export interface Task {
  id: string
  title: string
  description?: string
  status: TaskStatus
  assigneeId?: string
  createdBy: string
  dueDate?: string
  createdAt: string
  updatedAt: string
}

export interface Comment {
  id: string
  taskId: string
  authorId: string
  text: string
  createdAt: string
}

interface ApiTask {
  id: string
  title: string
  description?: string
  status: TaskStatus
  assignee_id?: string
  created_by: string
  due_date?: string
  created_at: string
  updated_at: string
}

interface ApiComment {
  id: string
  task_id: string
  author_id: string
  text: string
  created_at: string
}

export interface TaskListResponse {
  tasks: Task[]
  total: number
}

export interface TaskDetailResponse {
  task: Task
  comments: Comment[]
}

export interface CreateTaskRequest {
  title: string
  description?: string
  dueDate?: string
}

export interface UpdateStatusRequest {
  status: TaskStatus
}

export interface AssignTaskRequest {
  assigneeId: string
}

export interface UpdateMetadataRequest {
  title?: string
  dueDate?: string
  description?: string
}

export interface CreateCommentRequest {
  text: string
}

function mapTask(task: ApiTask): Task {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status,
    assigneeId: task.assignee_id,
    createdBy: task.created_by,
    dueDate: task.due_date,
    createdAt: task.created_at,
    updatedAt: task.updated_at,
  }
}

function mapComment(comment: ApiComment): Comment {
  return {
    id: comment.id,
    taskId: comment.task_id,
    authorId: comment.author_id,
    text: comment.text,
    createdAt: comment.created_at,
  }
}

export async function getTasks(): Promise<TaskListResponse> {
  const res = await apiClient.get<{ tasks: ApiTask[]; total: number }>('/tasks')
  return {
    tasks: res.data.tasks.map(mapTask),
    total: res.data.total,
  }
}

export async function getTaskById(id: string): Promise<TaskDetailResponse> {
  const res = await apiClient.get<{ task: ApiTask; comments: ApiComment[] }>(`/tasks/${id}`)
  return {
    task: mapTask(res.data.task),
    comments: res.data.comments.map(mapComment),
  }
}

export async function createTask(data: CreateTaskRequest): Promise<Task> {
  const res = await apiClient.post<ApiTask>('/tasks', {
    title: data.title,
    description: data.description,
    due_date: data.dueDate,
  })
  return mapTask(res.data)
}

export async function updateTaskStatus(id: string, data: UpdateStatusRequest): Promise<Task> {
  const res = await apiClient.patch<ApiTask>(`/tasks/${id}/status`, data)
  return mapTask(res.data)
}

export async function assignTask(id: string, data: AssignTaskRequest): Promise<Task> {
  const res = await apiClient.patch<ApiTask>(`/tasks/${id}/assign`, {
    assignee_id: data.assigneeId,
  })
  return mapTask(res.data)
}

export async function updateTaskMetadata(id: string, data: UpdateMetadataRequest): Promise<Task> {
  const res = await apiClient.patch<ApiTask>(`/tasks/${id}/metadata`, {
    title: data.title,
    description: data.description,
    due_date: data.dueDate,
  })
  return mapTask(res.data)
}

export async function deleteTask(id: string): Promise<void> {
  await apiClient.delete(`/tasks/${id}`)
}

export async function addComment(taskId: string, data: CreateCommentRequest): Promise<Comment> {
  const res = await apiClient.post<ApiComment>(`/tasks/${taskId}/comments`, data)
  return mapComment(res.data)
}
