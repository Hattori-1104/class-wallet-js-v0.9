import { type LoaderFunctionArgs, redirect } from "@remix-run/node"
import { Form, Link, Outlet, useLoaderData, useLocation, useMatches, useNavigate } from "@remix-run/react"
import { ChevronLeft, LogOut } from "lucide-react"
import { useState } from "react"
import { Button } from "~/components/ui/button"
import { prisma } from "~/service.server/repository"
import { commitToastByCase, getSessionInfo } from "~/service.server/session"

export type AppContextType = {
  setBackRoute: (backRoute: string) => void
}

export async function loader({ request }: LoaderFunctionArgs) {
  const { success, session, sessionData } = await getSessionInfo(request)
  if (!success) {
    return redirect("/auth", { headers: { "Set-Cookie": await commitToastByCase(session, "UnAuthorized") } })
  }

  // URLのパスを取得
  const url = new URL(request.url)
  const path = url.pathname

  if (sessionData.userType === "teacher") {
    // 教師用ページへリダイレクト
    if (!path.startsWith("/teacher")) {
      return redirect("/teacher")
    }
    const user = await prisma.teacher.findUnique({
      where: {
        id: sessionData.userId,
      },
    })
    if (user === null) {
      return redirect("/auth/teacher/login", { headers: { "Set-Cookie": await commitToastByCase(session, "UnAuthorized") } })
    }
    return { user, userType: sessionData.userType }
  }

  if (sessionData.userType === "student") {
    // 生徒用ページへリダイレクト
    if (!path.startsWith("/student")) {
      return redirect("/student")
    }
    const user = await prisma.user.findUnique({
      where: {
        id: sessionData.userId,
      },
    })
    if (user === null) {
      return redirect("/auth/student/login", { headers: { "Set-Cookie": await commitToastByCase(session, "UnAuthorized") } })
    }
    return { user, userType: sessionData.userType }
  }

  return redirect("/auth", { headers: { "Set-Cookie": await commitToastByCase(session, "UnAuthorized") } })
}

export default function AppLayout() {
  const { user, userType } = useLoaderData<typeof loader>()
  const location = useLocation()
  const navigate = useNavigate()
  const [backRoute, setBackRoute] = useState<string>("/")
  const isRootPath = location.pathname === "/student" || location.pathname === "/teacher"

  return (
    <div className="flex flex-col h-screen">
      {/* ナビゲーションバー */}
      <nav className="h-16 border-b">
        <div className="container mx-auto flex h-full items-center justify-between px-4">
          <div className="flex items-center gap-4">
            {isRootPath ? (
              <Link to={userType === "teacher" ? "/teacher" : "/student"}>
                <h1 className="text-xl font-bold">ClassWallet.js</h1>
              </Link>
            ) : (
              <Button type="submit" size="icon" onClick={() => navigate(backRoute)} variant="ghost" className="border border-gray-200 hover:bg-gray-100">
                <ChevronLeft />
              </Button>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex flex-col text-right">
              <div className="text-sm font-medium">{user.name}</div>
              <div className="text-xs text-muted-foreground">{user.email}</div>
            </div>
            <Form action="/auth/logout" method="post">
              <Button variant="outline" type="submit" size="icon">
                <LogOut />
              </Button>
            </Form>
          </div>
        </div>
      </nav>

      {/* メインコンテンツ */}
      <main className="flex-1 bg-gray-50 relative">
        <div className="absolute overflow-y-auto h-full w-full">
          <Outlet context={{ setBackRoute }} />
        </div>
      </main>
    </div>
  )
}
