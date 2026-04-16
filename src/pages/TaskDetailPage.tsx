import { FormEvent, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getApiErrorMessage } from '../api/errorMessage'
import { requestNotificationsRefresh } from '../api/notifications'
import {
  addComment,
  assignTask,
  Comment,
  deleteTask,
  getTaskById,
  Task,
  TaskStatus,
  updateTaskMetadata,
  updateTaskStatus,
} from '../api/tasks'
import { getUsers, UserSummary } from '../api/users'
import ConfirmDialog from '../components/ConfirmDialog'
import NotificationBell from '../components/NotificationBell'
import TaskStatusBadge from '../components/TaskStatusBadge'
import { useAuth } from '../contexts/AuthContext'
import { formatDate, formatDateTime } from '../lib/datetime'

export default function TaskDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { logout, user } = useAuth()

  const [task, setTask] = useState<Task | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [users, setUsers] = useState<UserSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [commentContent, setCommentContent] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)
  const [assigneeId, setAssigneeId] = useState('')
  const [assigning, setAssigning] = useState(false)
  const [metadataTitle, setMetadataTitle] = useState('')
  const [metadataDescription, setMetadataDescription] = useState('')
  const [metadataDueDate, setMetadataDueDate] = useState('')
  const [savingMetadata, setSavingMetadata] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const isLead = user?.role === 'lead'
  const canUpdateStatus = !!user && !!task && (task.createdBy === user.id || task.assigneeId === user.id)

  useEffect(() => {
    if (!id) {
      setError('Task not found.')
      setLoading(false)
      return
    }

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
        toast.error(message)
      })
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (!task) {
      return
    }

    setAssigneeId(task.assigneeId ?? '')
    setMetadataTitle(task.title)
    setMetadataDescription(task.description ?? '')
    setMetadataDueDate(task.dueDate ?? '')
  }, [task])

  useEffect(() => {
    if (!isLead) {
      return
    }

    getUsers()
      .then(setUsers)
      .catch((error) => {
        toast.error(getApiErrorMessage(error, 'Failed to load users for assignment.'))
      })
  }, [isLead])

  const userMap = useMemo(
    () => Object.fromEntries(users.map((item) => [item.id, item.email])),
    [users],
  )

  function formatUser(userId?: string) {
    if (!userId) {
      return 'Unassigned'
    }

    return userMap[userId] ? `${userMap[userId]} (${userId})` : userId
  }

  async function handleStatusChange(status: TaskStatus) {
    if (!id || !task) {
      return
    }

    try {
      const updated = await updateTaskStatus(id, { status })
      setTask(updated)
      toast.success('Task status updated.')
    } catch (error) {
      const message = getApiErrorMessage(error, 'Failed to update status.')
      setError(message)
      toast.error(message)
    }
  }

  async function handleAddComment(event: FormEvent) {
    event.preventDefault()
    if (!id || !commentContent.trim()) {
      return
    }

    setSubmittingComment(true)
    try {
      const comment = await addComment(id, { text: commentContent.trim() })
      setComments((prev) => [...prev, comment])
      setCommentContent('')
      toast.success('Comment added.')
      window.setTimeout(() => requestNotificationsRefresh(), 800)
    } catch (error) {
      const message = getApiErrorMessage(error, 'Failed to add comment.')
      setError(message)
      toast.error(message)
    } finally {
      setSubmittingComment(false)
    }
  }

  async function handleAssignTask(event: FormEvent) {
    event.preventDefault()
    if (!id || !assigneeId) {
      return
    }

    setAssigning(true)
    try {
      const updated = await assignTask(id, { assigneeId })
      setTask(updated)
      setAssigneeId(updated.assigneeId ?? '')
      toast.success('Task assigned successfully.')
      window.setTimeout(() => requestNotificationsRefresh(), 800)
    } catch (error) {
      const message = getApiErrorMessage(error, 'Failed to assign task.')
      setError(message)
      toast.error(message)
    } finally {
      setAssigning(false)
    }
  }

  async function handleSaveMetadata(event: FormEvent) {
    event.preventDefault()
    if (!id) {
      return
    }

    setSavingMetadata(true)
    try {
      const updated = await updateTaskMetadata(id, {
        title: metadataTitle.trim() || undefined,
        description: metadataDescription.trim() || undefined,
        dueDate: metadataDueDate || undefined,
      })
      setTask(updated)
      toast.success('Task details updated.')
    } catch (error) {
      const message = getApiErrorMessage(error, 'Failed to update task details.')
      setError(message)
      toast.error(message)
    } finally {
      setSavingMetadata(false)
    }
  }

  async function handleDeleteTask() {
    if (!id || !window.confirm('Delete this task?')) {
      return
    }

    setDeleting(true)
    try {
      await deleteTask(id)
      toast.success('Task deleted.')
      navigate('/tasks')
    } catch (error) {
      const message = getApiErrorMessage(error, 'Failed to delete task.')
      setError(message)
      toast.error(message)
      setDeleting(false)
    }
  }

  if (loading) {
    return <div className="p-8 text-sm text-gray-500">Loading...</div>
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
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <button onClick={() => navigate('/tasks')} className="text-sm text-gray-500 hover:text-gray-800">
            Back to tasks
          </button>
          <div className="flex items-center gap-3">
            <NotificationBell />
            <button onClick={() => setShowLogoutConfirm(true)} className="text-sm text-gray-500 hover:text-gray-800">
              Sign out
            </button>
            {isLead && (
              <Link to="/users" className="text-sm text-indigo-600 hover:underline">
                Manage users
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
        <section className="rounded-xl bg-white p-6 shadow">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{task.title}</h1>
              {task.description && <p className="mt-2 text-sm text-gray-600">{task.description}</p>}
            </div>
            <TaskStatusBadge status={task.status} />
          </div>

          <dl className="mt-6 grid gap-4 text-sm md:grid-cols-2">
            <div>
              <dt className="text-gray-500">Created by</dt>
              <dd className="font-medium text-gray-800">{formatUser(task.createdBy)}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Assignee</dt>
              <dd className="font-medium text-gray-800">{formatUser(task.assigneeId)}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Due date</dt>
              <dd className="font-medium text-gray-800">
                {task.dueDate ? formatDate(task.dueDate) : 'Not set'}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Updated</dt>
              <dd className="font-medium text-gray-800">{formatDateTime(task.updatedAt)}</dd>
            </div>
          </dl>

          <div className="mt-6">
            <h2 className="text-sm font-semibold text-gray-900">Status actions</h2>
            {canUpdateStatus ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {(['todo', 'in_progress', 'done'] as TaskStatus[]).map((status) => (
                  <button
                    key={status}
                    disabled={task.status === status}
                    onClick={() => handleStatusChange(status)}
                    className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40"
                  >
                    Mark {status.replace('_', ' ')}
                  </button>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-gray-500">Only the creator or assignee can change status.</p>
            )}
          </div>
        </section>

        {isLead && (
          <section className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
            <div className="rounded-xl bg-white p-6 shadow">
              <h2 className="text-base font-semibold text-gray-900">Assign task</h2>
              <p className="mt-1 text-sm text-gray-500">Leads can reassign this task to any user.</p>

              <form onSubmit={handleAssignTask} className="mt-4 space-y-4">
                <select
                  value={assigneeId}
                  onChange={(event) => setAssigneeId(event.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select assignee</option>
                  {users.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.email} ({item.role})
                    </option>
                  ))}
                </select>

                <button
                  type="submit"
                  disabled={assigning || !assigneeId}
                  className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  {assigning ? 'Assigning...' : 'Save assignment'}
                </button>
              </form>

              <button
                type="button"
                onClick={handleDeleteTask}
                disabled={deleting}
                className="mt-6 w-full rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete task'}
              </button>
            </div>

            <div className="rounded-xl bg-white p-6 shadow">
              <h2 className="text-base font-semibold text-gray-900">Edit task details</h2>
              <p className="mt-1 text-sm text-gray-500">Only leads can change title, description, and due date.</p>

              <form onSubmit={handleSaveMetadata} className="mt-4 space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="task-title">
                    Title
                  </label>
                  <input
                    id="task-title"
                    type="text"
                    value={metadataTitle}
                    onChange={(event) => setMetadataTitle(event.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="task-description">
                    Description
                  </label>
                  <textarea
                    id="task-description"
                    rows={4}
                    value={metadataDescription}
                    onChange={(event) => setMetadataDescription(event.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="task-due-date">
                    Due date
                  </label>
                  <input
                    id="task-due-date"
                    type="date"
                    value={metadataDueDate}
                    onChange={(event) => setMetadataDueDate(event.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={savingMetadata}
                  className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  {savingMetadata ? 'Saving...' : 'Save details'}
                </button>
              </form>
            </div>
          </section>
        )}

        <section className="rounded-xl bg-white p-6 shadow">
          <h2 className="text-base font-semibold text-gray-900">Comments</h2>

          {comments.length === 0 && <p className="mt-3 text-sm text-gray-500">No comments yet.</p>}

          <ul className="mt-4 space-y-3">
            {comments.map((comment) => (
              <li key={comment.id} className="rounded-md bg-gray-50 px-4 py-3 text-sm text-gray-800">
                <p>{comment.text}</p>
                <p className="mt-2 text-xs text-gray-500">
                  {formatUser(comment.authorId)} - {formatDateTime(comment.createdAt)}
                </p>
              </li>
            ))}
          </ul>

          <form onSubmit={handleAddComment} className="mt-4 flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              placeholder="Add a comment..."
              value={commentContent}
              onChange={(event) => setCommentContent(event.target.value)}
              className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={submittingComment || !commentContent.trim()}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {submittingComment ? 'Posting...' : 'Post comment'}
            </button>
          </form>
        </section>
      </main>
      <ConfirmDialog
        open={showLogoutConfirm}
        title="Sign out now?"
        message="You will need to sign in again to continue tracking this task."
        confirmLabel="Sign out"
        cancelLabel="Stay here"
        onCancel={() => setShowLogoutConfirm(false)}
        onConfirm={() => {
          setShowLogoutConfirm(false)
          logout()
        }}
      />
    </div>
  )
}
