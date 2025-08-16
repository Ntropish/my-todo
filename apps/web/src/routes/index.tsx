import { createFileRoute, Link } from '@tanstack/react-router'

import { Button } from '@workspace/ui/components/button'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  return (
    <div className="text-center py-8 space-y-4">
      <Button variant="outline" onClick={() => console.log('clicked')}>
        Click me
      </Button>
      <div>
        <Link to="/todos" className="underline text-blue-600">
          Go to Todos
        </Link>
      </div>
    </div>
  )
}
