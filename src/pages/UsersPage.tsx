import { FormEvent, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { UserRole } from '../api/auth'
import { getApiErrorMessage } from '../api/errorMessage'
import { createManagedUser, deleteUser, getUsers, updateUser, UserSummary } from '../api/users'
import { useToast } from '../contexts/ToastContext'

interface UserDraft {
  email: string
  role: UserRole
  password: string
}

function buildDraft(user: UserSummary): UserDraft {
  return {
    email: user.email,
    role: user.role,
    password: '',
  }
}

export default function UsersPage() {
  const { showToast } = useToast()
  const [users, setUsers] = useState<UserSummary[]>([])
  const [drafts, setDrafts] = useState<Record<string, UserDraft>>({})
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [createForm, setCreateForm] = useState<UserDraft>({
    email: '',
    password: '',
    role: 'member',
  })

  useEffect(() => {
    async function loadUsers() {
      setLoading(true)
      setError(null)
      try {
        const data = await getUsers()
        setUsers(data)
        setDrafts(Object.fromEntries(data.map((user) => [user.id, buildDraft(user)])))
      } catch (error) {
        const message = getApiErrorMessage(error, 'Failed to load users.')
        setError(message)
        showToast(message, 'error')
      } finally {
        setLoading(false)
      }
    }

    loadUsers()
  }, [showToast])

  function updateDraft(userId: string, changes: Partial<UserDraft>) {
    setDrafts((prev) => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        ...changes,
      },
    }))
  }

  async function handleCreateUser(event: FormEvent) {
    event.preventDefault()
    setCreating(true)
    try {
      const created = await createManagedUser({
        email: createForm.email.trim(),
        password: createForm.password,
        role: createForm.role,
      })
      setUsers((prev) => [created, ...prev])
      setDrafts((prev) => ({ ...prev, [created.id]: buildDraft(created) }))
      setCreateForm({ email: '', password: '', role: 'member' })
      showToast('User created successfully.', 'success')
    } catch (error) {
      showToast(getApiErrorMessage(error, 'Failed to create user.'), 'error')
    } finally {
      setCreating(false)
    }
  }

  async function handleUpdateUser(user: UserSummary) {
    const draft = drafts[user.id]
    if (!draft) {
      return
    }

    const payload = {
      email: draft.email.trim(),
      role: draft.role,
      password: draft.password.trim() || undefined,
    }

    setSavingId(user.id)
    try {
      const updated = await updateUser(user.id, payload)
      setUsers((prev) => prev.map((item) => (item.id === user.id ? updated : item)))
      setDrafts((prev) => ({ ...prev, [user.id]: buildDraft(updated) }))
      showToast('User updated successfully.', 'success')
    } catch (error) {
      showToast(getApiErrorMessage(error, 'Failed to update user.'), 'error')
    } finally {
      setSavingId(null)
    }
  }

  async function handleDeleteUser(user: UserSummary) {
    if (!window.confirm(`Delete user ${user.email}?`)) {
      return
    }

    setDeletingId(user.id)
    try {
      await deleteUser(user.id)
      setUsers((prev) => prev.filter((item) => item.id !== user.id))
      setDrafts((prev) => {
        const next = { ...prev }
        delete next[user.id]
        return next
      })
      showToast('User deleted.', 'success')
    } catch (error) {
      showToast(getApiErrorMessage(error, 'Failed to delete user.'), 'error')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">User management</h1>
            <p className="text-sm text-gray-500">Only leads can create, edit, and delete users.</p>
          </div>
          <Link to="/tasks" className="text-sm text-gray-500 hover:text-gray-800">
            Back to tasks
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
        <section className="rounded-xl bg-white p-6 shadow">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-gray-900">Create user</h2>
            <p className="text-sm text-gray-500">New accounts created here can be member or lead.</p>
          </div>

          <form onSubmit={handleCreateUser} className="grid gap-4 md:grid-cols-4">
            <input
              type="email"
              required
              placeholder="Email"
              value={createForm.email}
              onChange={(event) => setCreateForm((prev) => ({ ...prev, email: event.target.value }))}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="password"
              required
              minLength={8}
              placeholder="Password"
              value={createForm.password}
              onChange={(event) => setCreateForm((prev) => ({ ...prev, password: event.target.value }))}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <select
              value={createForm.role}
              onChange={(event) => setCreateForm((prev) => ({ ...prev, role: event.target.value as UserRole }))}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="member">Member</option>
              <option value="lead">Lead</option>
            </select>
            <button
              type="submit"
              disabled={creating}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {creating ? 'Creating...' : 'Create user'}
            </button>
          </form>
        </section>

        <section className="rounded-xl bg-white p-6 shadow">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-gray-900">All users</h2>
              <p className="text-sm text-gray-500">You can change email, password, and role here.</p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              {users.length} users
            </span>
          </div>

          {loading && <p className="text-sm text-gray-500">Loading users...</p>}

          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {!loading && !error && users.length === 0 && (
            <p className="text-sm text-gray-500">No users found.</p>
          )}

          <div className="space-y-4">
            {users.map((user) => {
              const draft = drafts[user.id] ?? buildDraft(user)
              return (
                <article key={user.id} className="rounded-xl border border-gray-200 p-4">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">{user.email}</h3>
                      <p className="text-xs text-gray-500">
                        {user.id} · Created {new Date(user.created_at).toLocaleString()}
                      </p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                      {user.role}
                    </span>
                  </div>

                  <div className="grid gap-3 md:grid-cols-3">
                    <input
                      type="email"
                      value={draft.email}
                      onChange={(event) => updateDraft(user.id, { email: event.target.value })}
                      className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <input
                      type="password"
                      placeholder="New password (optional)"
                      value={draft.password}
                      onChange={(event) => updateDraft(user.id, { password: event.target.value })}
                      className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <select
                      value={draft.role}
                      onChange={(event) => updateDraft(user.id, { role: event.target.value as UserRole })}
                      className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="member">Member</option>
                      <option value="lead">Lead</option>
                    </select>
                  </div>

                  <div className="mt-4 flex flex-wrap justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => handleDeleteUser(user)}
                      disabled={deletingId === user.id}
                      className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
                    >
                      {deletingId === user.id ? 'Deleting...' : 'Delete'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateUser(user)}
                      disabled={savingId === user.id}
                      className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {savingId === user.id ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        </section>
      </main>
    </div>
  )
}
