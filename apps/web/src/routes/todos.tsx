import { createFileRoute, Link } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Button } from '@workspace/ui/components/button'

export const Route = createFileRoute('/todos')({
  component: TodosPage,
})

export type Todo = { id: number; title: string; completed: boolean }

async function fetchJSON<T>(
  input: RequestInfo,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(input, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
  if (!res.ok) {
    const txt = await res.text()
    throw new Error(txt || res.statusText)
  }
  return res.json()
}

function TodosPage() {
  const qc = useQueryClient()

  const {
    data: todos = [],
    isLoading,
    isError,
    error,
  } = useQuery<Todo[]>({
    queryKey: ['todos'],
    queryFn: () => fetchJSON<Todo[]>('/todos'),
  })

  const createMutation = useMutation({
    mutationFn: (input: { title: string; completed?: boolean }) =>
      fetchJSON<Todo>('/todos', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['todos'] }),
  })

  const updateMutation = useMutation({
    mutationFn: (input: {
      id: number
      patch: Partial<Pick<Todo, 'title' | 'completed'>>
    }) =>
      fetchJSON<Todo>(`/todos/${input.id}`, {
        method: 'PUT',
        body: JSON.stringify(input.patch),
      }),
    onMutate: async ({ id, patch }) => {
      await qc.cancelQueries({ queryKey: ['todos'] })
      const prev = qc.getQueryData<Todo[]>(['todos'])
      if (prev) {
        qc.setQueryData<Todo[]>(
          ['todos'],
          prev.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        )
      }
      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(['todos'], ctx.prev)
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['todos'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      fetchJSON<{ message: string }>(`/todos/${id}`, { method: 'DELETE' }),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['todos'] })
      const prev = qc.getQueryData<Todo[]>(['todos'])
      if (prev) {
        qc.setQueryData<Todo[]>(
          ['todos'],
          prev.filter((t) => t.id !== id),
        )
      }
      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(['todos'], ctx.prev)
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['todos'] }),
  })

  const [title, setTitle] = useState('')

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Todos</h1>
        <Link to="/">Home</Link>
      </div>

      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          if (!title.trim()) return
          createMutation.mutate({ title })
          setTitle('')
        }}
      >
        <input
          className="flex-1 rounded border px-3 py-2"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="New todo title"
        />
        <Button type="submit" disabled={createMutation.isPending}>
          Add
        </Button>
      </form>

      {isLoading ? (
        <div>Loading...</div>
      ) : isError ? (
        <div className="text-red-600">Error: {String(error)}</div>
      ) : (
        <ul className="space-y-2">
          {todos.map((t) => (
            <li
              key={t.id}
              className="flex items-center gap-3 rounded border p-3"
            >
              <input
                type="checkbox"
                checked={t.completed}
                onChange={(e) =>
                  updateMutation.mutate({
                    id: t.id,
                    patch: { completed: e.target.checked },
                  })
                }
              />
              <input
                className="flex-1 rounded border px-2 py-1"
                value={t.title}
                onChange={(e) =>
                  updateMutation.mutate({
                    id: t.id,
                    patch: { title: e.target.value },
                  })
                }
              />
              <Link
                to="/todos/$todoId"
                params={{ todoId: String(t.id) }}
                className="text-blue-600 underline"
              >
                Details
              </Link>
              <Button
                variant="destructive"
                onClick={() => deleteMutation.mutate(t.id)}
              >
                Delete
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
