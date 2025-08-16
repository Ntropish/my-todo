import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/todos/$todoId')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/todos/$todoId"!</div>
}
