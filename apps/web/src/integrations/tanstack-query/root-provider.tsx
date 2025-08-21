import {
  QueryClient,
  QueryClientProvider,
  QueryCache,
  MutationCache,
} from '@tanstack/react-query'

import { toast } from 'sonner'

import { type ReonoClientError } from '@reono/client'

export function getContext() {
  const queryClient = new QueryClient({
    queryCache: new QueryCache({
      onError: (error: ReonoClientError) => {
        console.error('Query error:', error)

        if (error.detail) {
          toast.error(error.detail || error.message)
        } else {
          toast.error('An error occurred during the query.')
        }
      },
    }),
    mutationCache: new MutationCache({
      onError: (error: ReonoClientError) => {
        if (error.detail) {
          toast.error(error.detail || error.message)
        } else {
          toast.error('An error occurred during data submission.')
        }
      },
    }),
  })
  return {
    queryClient,
  }
}

export function Provider({
  children,
  queryClient,
}: {
  children: React.ReactNode
  queryClient: QueryClient
}) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
