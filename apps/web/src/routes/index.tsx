import { createFileRoute, Link, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: App,
  loader: () => {
    // Redirect to the todos page
    throw redirect({
      to: '/todos',
      replace: true,
    })
  },
})

function App() {
  redirect({
    to: '/todos',
    replace: true,
  })
  return (
    <div className="text-center">
      <header className="min-h-screen flex flex-col items-center justify-center bg-[#282c34] text-white text-[calc(10px+2vmin)]">
        <h1>Welcome to the Todo App</h1>
        <p>
          <Link to="/todos">
            You will be redirected to the Todos page shortly.
          </Link>
        </p>
      </header>
    </div>
  )
}
