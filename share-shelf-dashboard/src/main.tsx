import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { MantineProvider } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { routeTree } from './routeTree.gen'
import { AuthContextProvider, useAuth } from './contexts/AuthContext'
import { WithAxios } from './lib/axios'

const queryClient = new QueryClient()

const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  scrollRestoration: true,
  context: {
    isLoggedIn: false,
  },
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

function InnerApp() {
  const { token } = useAuth()
  const isLoggedIn = !!token?.accessToken

  return <RouterProvider router={router} context={{ isLoggedIn }} />
}

const rootElement = document.getElementById('app')!

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <QueryClientProvider client={queryClient}>
      <MantineProvider>
        <Notifications position="top-right" />
        <AuthContextProvider>
          <WithAxios>
            <InnerApp />
          </WithAxios>
        </AuthContextProvider>
      </MantineProvider>
    </QueryClientProvider>
  )
}

