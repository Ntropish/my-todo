import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import {
  rest,
  type TodoPatchInput,
  type TodoPostInput,
  type TodoId,
  todoPatchSchema,
  todoCreateSchema,
} from '@reono-todo/api'
import { Pencil, Trash2 } from 'lucide-react'

export const Route = createFileRoute('/todos/')({
  component: TodosPage,
  loader: () => rest.get('/todos'),
  pendingComponent: TodosLoading,
})

function TodosPage() {
  const qc = useQueryClient()
  const router = useRouter()

  const todos = Route.useLoaderData()

  const postMutation = useMutation({
    mutationFn: (input: TodoPostInput) =>
      rest.post('/todos', {
        body: input,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['todos'] })
      router.invalidate()
      toast.success('Todo created')
    },
  })

  const patchMutation = useMutation({
    mutationFn: (input: { id: TodoId; patch: TodoPatchInput }) =>
      rest.patch('/todos/:todoId', {
        params: { todoId: input.id },
        body: input.patch,
      }),

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['todos'] })
      router.invalidate()
      toast.success('Todo updated')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: TodoId) => {
      return rest.delete(`/todos/:todoId`, {
        params: { todoId: id },
      })
    },

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['todos'] })
      router.invalidate()
      toast.success('Todo deleted')
    },
  })

  const [title, setTitle] = useState('')
  const [deleteId, setDeleteId] = useState<number | null>(null)

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Todos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault()
              if (!title.trim()) {
                toast.error('Title is required')
                return
              }
              postMutation.mutate({ title, completed: false })
              setTitle('')
            }}
          >
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="New todo title"
              aria-label="New todo title"
              disabled={postMutation.isPending}
            />
            <Button type="submit" disabled={postMutation.isPending}>
              Add
            </Button>
          </form>

          <Separator />

          <ul className="space-y-2">
            {todos.map((t) => (
              <li key={t.id} className="flex items-center gap-3">
                <Checkbox
                  checked={t.completed}
                  onCheckedChange={(checked) =>
                    patchMutation.mutate({
                      id: t.id,
                      patch: { completed: Boolean(checked) },
                    })
                  }
                  aria-label={
                    t.completed ? 'Mark as incomplete' : 'Mark as complete'
                  }
                  disabled={patchMutation.isPending}
                />
                <Input
                  key={`${t.id}:${t.title}`}
                  defaultValue={t.title}
                  onBlur={(e) => {
                    const v = e.currentTarget.value
                    const validationResult = todoPatchSchema.safeParse({
                      title: v,
                    })
                    if (!validationResult.success) {
                      const errorMessage = validationResult.error.issues
                        .map((issue) => issue.message)
                        .join(', ')
                      toast.error(errorMessage)
                      return
                    }
                    patchMutation.mutate({ id: t.id, patch: { title: v } })
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.currentTarget.blur()
                    }
                  }}
                  aria-label="Todo title"
                />
                <Button
                  asChild
                  size="icon"
                  variant="ghost"
                  aria-label="Edit todo"
                >
                  <Link to="/todos/$todoId" params={{ todoId: String(t.id) }}>
                    <Pencil className="size-4" />
                  </Link>
                </Button>

                <AlertDialog
                  open={deleteId === t.id}
                  onOpenChange={(open) => !open && setDeleteId(null)}
                >
                  <AlertDialogTrigger asChild>
                    <Button
                      size="icon"
                      variant="destructive"
                      aria-label="Delete todo"
                      onClick={() => setDeleteId(t.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete todo?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete the todo.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => {
                          if (deleteId != null) {
                            deleteMutation.mutate(deleteId)
                            setDeleteId(null)
                          }
                        }}
                      >
                        Confirm
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

function TodosLoading() {
  const rows = useMemo(() => Array.from({ length: 3 }), [])
  return (
    <div className="max-w-3xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Todos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-20" />
          </div>
          <Separator />
          <ul className="space-y-2">
            {rows.map((_, i) => (
              <li key={i} className="flex items-center gap-3">
                <Skeleton className="size-5 rounded" />
                <Skeleton className="h-9 flex-1" />
                <Skeleton className="size-9 rounded-md" />
                <Skeleton className="size-9 rounded-md" />
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
