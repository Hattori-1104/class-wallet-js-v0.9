import { type LoaderFunctionArgs, SessionData } from "@remix-run/node"
import { Form, Outlet, useLoaderData } from "@remix-run/react"
import { Link } from "@remix-run/react"
import { ChevronLeft, LogIn } from "lucide-react"
import { LogOut } from "lucide-react"
import { Button } from "~/components/ui/button"
import { prisma } from "~/service.server/repository"
import { getSessionInfo } from "~/service.server/session"

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { success, session, sessionData } = await getSessionInfo(request)
  if (success) {
    const user = await prisma.user.findUnique({ where: { id: sessionData.userId } })
    return { sessionData, user }
  }
  return { sessionData: null, user: null }
}

export type AuthContextType = {
  sessionData: SessionData | null
}

export default function Auth() {
  const { sessionData, user } = useLoaderData<typeof loader>()
  return (
    <>
      <nav className="h-16 border-b">
        <div className="container mx-auto flex h-full items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link to="/">
              <h1 className="text-xl font-bold">ClassWallet.js</h1>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <div className="flex flex-col text-right">
                  <div className="text-sm font-medium">{user.name}</div>
                  <div className="text-xs text-gray-500">{user.email}</div>
                </div>
                <Form action="/auth/logout" method="post">
                  <Button variant="outline" type="submit" size="icon">
                    <LogOut />
                  </Button>
                </Form>
              </>
            ) : (
              <Button variant="outline" type="submit" size="icon">
                <LogIn />
              </Button>
            )}
          </div>
        </div>
      </nav>
      <Outlet context={{ sessionData }} />{" "}
    </>
  )
}
