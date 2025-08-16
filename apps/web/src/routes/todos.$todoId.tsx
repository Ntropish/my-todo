import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@workspace/ui/components/button'

export const Route = createFileRoute('/todos/$todoId')({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData({
      queryKey: ['todo', params.todoId],
      queryFn: () => fetchJSON<Todo>(`/api/todos/${params.todoId}`),
    }),
  component: TodoDetailPage,
})

function RouteComponent() {
  return <div>Hello "/todos/$todoId"!</div>
}

type Todo = { id: number; title: string; completed: boolean }

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

function TodoDetailPage() {
  const params = Route.useParams()
  const qc = useQueryClient()
  const id = params.todoId

  const { data: todo } = useQuery({
    queryKey: ['todo', id],
    queryFn: () => fetchJSON<Todo>(`/api/todos/${id}`),
  })

  const updateMutation = useMutation({
    mutationFn: (patch: Partial<Pick<Todo, 'title' | 'completed'>>) =>
      fetchJSON<Todo>(`/todos/${id}`, {
        method: 'PUT',
        body: JSON.stringify(patch),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['todo', id] })
      qc.invalidateQueries({ queryKey: ['todos'] })
    },
  })

  if (!todo) return <div className="p-6">Loading...</div>

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Todo #{todo.id}</h1>
        <a href="/todos" className="underline text-blue-600">
          Back to list
        </a>
      </div>

      <div className="space-y-4 rounded border p-4">
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={(e) =>
              updateMutation.mutate({ completed: e.target.checked })
            }
          />
          <span>Completed</span>
        </label>

        <div className="flex gap-2 items-center">
          <input
            className="flex-1 rounded border px-3 py-2"
            defaultValue={todo.title}
            onBlur={(e) => {
              const v = e.currentTarget.value
              if (v !== todo.title) updateMutation.mutate({ title: v })
            }}
          />
          <Button
            onClick={() => qc.invalidateQueries({ queryKey: ['todo', id] })}
          >
            Refetch
          </Button>
        </div>
      </div>
    </div>
  )
}
