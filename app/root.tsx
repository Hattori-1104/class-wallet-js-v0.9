import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node"
import { Links, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData, useParams, useSearchParams } from "@remix-run/react"
import { type ReactNode, useEffect } from "react"
import { Toaster } from "~/components/ui/sonner"

import "./tailwind.css"
import { toast } from "sonner"
import { getSession } from "./services/session.server"

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
]

export function Layout({ children }: { children: ReactNode }) {
  const [searchParams, setSearchParams] = useSearchParams()
  useEffect(() => {
    if (searchParams.has("error")) {
      toast.error("エラーが発生しました")
      setSearchParams((prev) => {
        prev.delete("error")
        return prev
      })
    }
  }, [searchParams, setSearchParams])
  return (
    <html lang="ja">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <div className="absolute inset-0 flex flex-col bg-gray-50">{children}</div>
        <Toaster />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function App() {
  return <Outlet />
}
