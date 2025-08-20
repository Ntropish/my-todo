import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/todos')({
  component: TodosLayout,
})

function TodosLayout() {
  return (
    <div className="min-h-screen">
      <Outlet />
    </div>
  )
}
