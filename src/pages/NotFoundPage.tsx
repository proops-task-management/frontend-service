import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center px-4">
      <h1 className="text-5xl font-bold text-gray-900">404</h1>
      <p className="mt-3 text-gray-600">Page not found.</p>
      <Link to="/tasks" className="mt-6 text-sm font-medium text-indigo-600 hover:underline">
        Go to tasks
      </Link>
    </div>
  )
}
