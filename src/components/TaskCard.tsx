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
      className="w-full rounded-xl border border-gray-100 bg-white p-4 text-left shadow transition-shadow hover:shadow-md"
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <h3 className="line-clamp-2 text-sm font-semibold text-gray-900">{task.title}</h3>
        <TaskStatusBadge status={task.status} />
      </div>

      {task.description && <p className="mb-3 line-clamp-2 text-xs text-gray-500">{task.description}</p>}

      <div className="flex items-center gap-2 text-xs text-gray-400">
        {task.assigneeId && <span className="truncate">Assignee {task.assigneeId}</span>}
        {task.assigneeId && task.dueDate && <span>|</span>}
        {task.dueDate && <span>Due {new Date(task.dueDate).toLocaleDateString()}</span>}
      </div>
    </button>
  )
}
