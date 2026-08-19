import { createFileRoute, Outlet } from '@tanstack/react-router'
import { Meta, Scripts, ScrollRestoration } from '@tanstack/react-start'
import { type ReactNode } from 'react'
import { QueryClient } from '@tanstack/react-query'
import { Toaster } from "@/components/ui/sonner"
import '@/styles.css'

export const Route = createFileRoute('__root')({
  meta: () => [
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
        <Meta />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}
