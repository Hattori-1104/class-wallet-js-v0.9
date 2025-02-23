import { type LoaderFunctionArgs, SessionData } from "@remix-run/node"
import { Outlet, useLoaderData } from "@remix-run/react"
import { getSessionInfo } from "~/service.server/session"

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { success, session, sessionData } = await getSessionInfo(request)
  if (success) return { sessionData }
  return { sessionData: null }
}

export type AuthContextType = {
  sessionData: SessionData | null
}

export default function Auth() {
  const { sessionData } = useLoaderData<typeof loader>()
  return <Outlet context={{ sessionData }} />
}
