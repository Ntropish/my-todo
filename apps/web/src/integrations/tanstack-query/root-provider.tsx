import {
  QueryClient,
  QueryClientProvider,
  QueryCache,
  MutationCache,
} from '@tanstack/react-query'

import { toast } from 'sonner'

export interface ReonoClientError<T = any> extends Error {
  status?: number
  response?: Response
  data?: T
}

export function getContext() {
  const queryClient = new QueryClient({
    queryCache: new QueryCache({
      onError: (error: ReonoClientError, query) => {
        console.error('Query error:', error)

        if (error.message) {
          toast.error(error.message)
        } else {
          toast.error('An error occurred during data fetching.')
        }
      },
    }),
    mutationCache: new MutationCache({
      onError: (error: ReonoClientError, mutation) => {
        console.error('Mutation error:', error)
        console.dir(error)

        if (error.message) {
          toast.error(error.message)
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
