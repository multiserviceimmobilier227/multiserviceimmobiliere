import { createRootRouteWithContext, Outlet, ScrollRestoration } from '@tanstack/react-router'
import { HeadContent, Scripts } from '@tanstack/react-router'
import { type ReactNode } from 'react'
import { Toaster } from "@/components/ui/sonner"
import { type QueryClient } from '@tanstack/react-query'
import '@/styles.css'

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'MSI 2.0 — Logiciel de Gestion Immobilière',
      },
      {
        name: 'description',
        content: 'Système de gestion immobilière pour Multi Services Immobilière, Maradi (Niger).',
      },
    ],
  }),
  component: RootComponent,
})

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
      <Toaster position="top-right" richColors />
    </RootDocument>
  )
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}
