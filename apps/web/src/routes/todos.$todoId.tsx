import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { rest, type TodoPatchInput } from '@reono-todo/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'

export const Route = createFileRoute('/todos/$todoId')({
  component: TodoDetailPage,
  loader: ({ params }) =>
    rest.get('/todos/:todoId', {
      params: { todoId: params.todoId },
    }),
  pendingComponent: TodoDetailLoading,
})

function TodoDetailPage() {
  const params = Route.useParams()
  const qc = useQueryClient()
  const id = params.todoId
  const todo = Route.useLoaderData()
  const router = useRouter()

  const updateMutation = useMutation({
    mutationFn: (body: TodoPatchInput) =>
      rest.patch('/todos/:todoId', {
        params: {
          todoId: id,
        },
        body,
      }),

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['todo', id] })
      router.invalidate()
      toast.success('Todo updated')
    },
    onError: () => toast.error('Failed to update todo'),
  })

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <CardTitle className="text-xl">Todo #{todo.id}</CardTitle>
          <Button asChild variant="ghost" size="icon" aria-label="Back to list">
            <Link to="/todos">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 items-center">
            <Input
              defaultValue={todo.title}
              onBlur={(e) => {
                const v = e.currentTarget.value
                if (v !== todo.title) updateMutation.mutate({ title: v })
              }}
              aria-label="Todo title"
              disabled={updateMutation.isPending}
            />
          </div>

          <div className="flex items-center gap-3">
            <Checkbox
              id="completed"
              checked={todo.completed}
              onCheckedChange={(checked) =>
                updateMutation.mutate({ completed: Boolean(checked) })
              }
              disabled={updateMutation.isPending}
            />
            <Label htmlFor="completed">Completed</Label>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function TodoDetailLoading() {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="size-9 rounded-md" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-9 w-full" />
          <div className="flex items-center gap-3">
            <Skeleton className="size-5 rounded" />
            <Skeleton className="h-5 w-28" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
