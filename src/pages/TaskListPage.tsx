import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { getApiErrorMessage } from '../api/errorMessage'
import { getTasks, Task } from '../api/tasks'
import TaskCard from '../components/TaskCard'
import CreateTaskModal from '../components/CreateTaskModal'

export default function TaskListPage() {
  const { logout, user } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)

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
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">ProOps2026</h1>
          <button
            onClick={logout}
            className="text-sm text-gray-500 hover:text-gray-800"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Tasks</h2>
            {user && (
              <p className="text-sm text-gray-500">
                Signed in as <span className="font-medium text-gray-700">{user.role}</span>
              </p>
            )}
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            New task
          </button>
        </div>

        {loading && (
          <p className="text-sm text-gray-500">Loading…</p>
        )}

        {error && (
          <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && tasks.length === 0 && (
          <p className="text-sm text-gray-500">No tasks yet. Create one to get started.</p>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={() => navigate(`/tasks/${task.id}`)}
            />
          ))}
        </div>
      </main>

      {showCreate && (
        <CreateTaskModal
          onCreated={handleTaskCreated}
          onClose={() => setShowCreate(false)}
        />
      )}
    </div>
  )
}
