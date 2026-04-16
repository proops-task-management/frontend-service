import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '../api/errorMessage'
import { getTasks, Task } from '../api/tasks'
import TaskCard from '../components/TaskCardV2'
import CreateTaskModal from '../components/CreateTaskModalV2'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'

export default function TaskListPageV2() {
  const { logout, user } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)

  const isLead = user?.role === 'lead'

  async function fetchTasks() {
    setLoading(true)
    setError(null)
    try {
      const data = await getTasks()
      setTasks(data.tasks)
    } catch (error) {
      const message = getApiErrorMessage(error, 'Failed to load tasks.')
      setError(message)
      showToast(message, 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  function handleTaskCreated(task: Task) {
    setTasks((prev) => [task, ...prev])
    setShowCreate(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">ProOps2026</h1>
            {user && (
              <p className="text-sm text-gray-500">
                {user.email} · <span className="font-medium text-gray-700">{user.role}</span>
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            {isLead && (
              <Link
                to="/users"
                className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Manage users
              </Link>
            )}
            <button onClick={logout} className="text-sm text-gray-500 hover:text-gray-800">
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Tasks</h2>
            <p className="text-sm text-gray-500">
              Members only see related tasks. Leads can manage all tasks and users.
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            New task
          </button>
        </div>

        {loading && <p className="text-sm text-gray-500">Loading...</p>}

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && tasks.length === 0 && (
          <p className="text-sm text-gray-500">No tasks yet. Create one to get started.</p>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onClick={() => navigate(`/tasks/${task.id}`)} />
          ))}
        </div>
      </main>

      {showCreate && (
        <CreateTaskModal onCreated={handleTaskCreated} onClose={() => setShowCreate(false)} />
      )}
    </div>
  )
}
