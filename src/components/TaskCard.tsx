import { Task } from '../api/tasks'
import TaskStatusBadge from './TaskStatusBadge'

interface TaskCardProps {
  task: Task
  onClick: () => void
}

export default function TaskCard({ task, onClick }: TaskCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white rounded-xl shadow border border-gray-100 p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">{task.title}</h3>
        <TaskStatusBadge status={task.status} />
      </div>

      {task.description && (
        <p className="text-xs text-gray-500 line-clamp-2 mb-3">{task.description}</p>
      )}

      <div className="flex items-center gap-2 text-xs text-gray-400">
        {task.assigneeId && <span className="truncate">Assignee {task.assigneeId}</span>}
        {task.dueDate && (
          <>
            <span>·</span>
            <span>Due {new Date(task.dueDate).toLocaleDateString()}</span>
          </>
        )}
      </div>
    </button>
  )
}
