import { createFileRoute } from '@tanstack/react-router'

import { Button } from '@workspace/ui/components/button'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  return (
    <div className="text-center py-8">
      <Button variant="outline" onClick={() => console.log('clicked')}>
        Click me
      </Button>
    </div>
  )
}
