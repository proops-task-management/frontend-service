import { useEffect, useState, FormEvent } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  assignTask,
  getTaskById,
  updateTaskStatus,
  updateTaskMetadata,
  deleteTask,
  addComment,
  Task,
  TaskStatus,
  Comment,
} from '../api/tasks'
import { getApiErrorMessage } from '../api/errorMessage'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import TaskStatusBadge from '../components/TaskStatusBadge'

export default function TaskDetailPage() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [task, setTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [commentContent, setCommentContent] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [assigneeId, setAssigneeId] = useState('')
  const [assigning, setAssigning] = useState(false)
  const [metadataTitle, setMetadataTitle] = useState('')
  const [metadataDescription, setMetadataDescription] = useState('')
  const [metadataDueDate, setMetadataDueDate] = useState('')
  const [savingMetadata, setSavingMetadata] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setError(null)
    getTaskById(id)
      .then((data) => {
        setTask(data.task)
        setComments(data.comments)
      })
      .catch((error) => {
        const message = getApiErrorMessage(error, 'Task not found.')
        setError(message)
        showToast(message, 'error')
      })
      .finally(() => setLoading(false))
  }, [id, showToast])

  useEffect(() => {
    if (!task) {
      return
    }

    setAssigneeId(task.assigneeId ?? '')
    setMetadataTitle(task.title)
    setMetadataDescription(task.description ?? '')
    setMetadataDueDate(task.dueDate ?? '')
  }, [task])

  const isLead = user?.role === 'lead'
  const canUpdateStatus = !!user && !!task && (task.createdBy === user.id || task.assigneeId === user.id)

  async function handleStatusChange(status: TaskStatus) {
    if (!id || !task) return
    try {
      const updated = await updateTaskStatus(id, { status })
      setTask(updated)
      showToast('Task status updated.', 'success')
    } catch (error) {
      const message = getApiErrorMessage(error, 'Failed to update status.')
      setError(message)
      showToast(message, 'error')
    }
  }

  async function handleDelete() {
    if (!id || !confirm('Delete this task?')) return
    setDeleting(true)
    try {
      await deleteTask(id)
      showToast('Task deleted.', 'success')
      navigate('/tasks')
    } catch (error) {
      const message = getApiErrorMessage(error, 'Failed to delete task.')
      setError(message)
      showToast(message, 'error')
      setDeleting(false)
    }
  }

  async function handleAddComment(e: FormEvent) {
    e.preventDefault()
    if (!id || !commentContent.trim()) return
    setSubmittingComment(true)
    try {
      const comment = await addComment(id, { text: commentContent.trim() })
      setComments((prev) => [...prev, comment])
      setCommentContent('')
      showToast('Comment added.', 'success')
    } catch (error) {
      const message = getApiErrorMessage(error, 'Failed to add comment.')
      setError(message)
      showToast(message, 'error')
    } finally {
      setSubmittingComment(false)
    }
  }

  async function handleAssignTask(e: FormEvent) {
    e.preventDefault()
    if (!id || !assigneeId.trim()) return

    setAssigning(true)
    try {
      const updated = await assignTask(id, { assigneeId: assigneeId.trim() })
      setTask(updated)
      setAssigneeId(updated.assigneeId ?? '')
      showToast('Task assigned successfully.', 'success')
    } catch (error) {
      const message = getApiErrorMessage(error, 'Failed to assign task.')
      setError(message)
      showToast(message, 'error')
    } finally {
      setAssigning(false)
    }
  }

  async function handleSaveMetadata(e: FormEvent) {
    e.preventDefault()
    if (!id) return

    setSavingMetadata(true)
    try {
      const updated = await updateTaskMetadata(id, {
        title: metadataTitle.trim() || undefined,
        description: metadataDescription.trim() || undefined,
        dueDate: metadataDueDate || undefined,
      })
      setTask(updated)
      showToast('Task details updated.', 'success')
    } catch (error) {
      const message = getApiErrorMessage(error, 'Failed to update task details.')
      setError(message)
      showToast(message, 'error')
    } finally {
      setSavingMetadata(false)
    }
  }

  if (loading) {
    return <div className="p-8 text-sm text-gray-500">Loading…</div>
  }

  if (error || !task) {
    return (
      <div className="p-8">
        <p className="text-sm text-red-600">{error ?? 'Task not found.'}</p>
        <button onClick={() => navigate('/tasks')} className="mt-4 text-sm text-indigo-600 hover:underline">
          Back to tasks
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate('/tasks')}
            className="text-sm text-gray-500 hover:text-gray-800"
          >
            ← Tasks
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{task.title}</h1>
              {task.description && (
                <p className="mt-2 text-sm text-gray-600">{task.description}</p>
              )}
            </div>
            <TaskStatusBadge status={task.status} />
          </div>

          <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            {task.dueDate && (
              <div>
                <dt className="text-gray-500">Due date</dt>
                <dd className="font-medium text-gray-800">
                  {new Date(task.dueDate).toLocaleDateString()}
                </dd>
              </div>
            )}
            {task.assigneeId && (
              <div>
                <dt className="text-gray-500">Assignee</dt>
                <dd className="font-medium text-gray-800">{task.assigneeId}</dd>
              </div>
            )}
            <div>
              <dt className="text-gray-500">Created by</dt>
              <dd className="font-medium text-gray-800">{task.createdBy}</dd>
            </div>
          </dl>

          <div className="mt-6 flex flex-wrap gap-2">
            {(['todo', 'in_progress', 'done'] as TaskStatus[]).map((s) => (
              <button
                key={s}
                disabled={task.status === s}
                onClick={() => handleStatusChange(s)}
                className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40"
              >
                Mark {s.replace('_', ' ')}
              </button>
            ))}
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="ml-auto rounded-md bg-red-50 border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
            >
              {deleting ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Comments</h2>

          {comments.length === 0 && (
            <p className="text-sm text-gray-500 mb-4">No comments yet.</p>
          )}

          <ul className="space-y-3 mb-4">
            {comments.map((c) => (
              <li key={c.id} className="rounded-md bg-gray-50 px-4 py-3 text-sm text-gray-800">
                {c.text}
              </li>
            ))}
          </ul>

          <form onSubmit={handleAddComment} className="flex gap-2">
            <input
              type="text"
              placeholder="Add a comment…"
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={submittingComment || !commentContent.trim()}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              Post
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
