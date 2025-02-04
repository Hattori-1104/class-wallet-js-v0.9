import { type LoaderFunctionArgs, json, redirect } from "@remix-run/node"
import { Form, Link, Outlet, useLoaderData, useLocation } from "@remix-run/react"
import { Button } from "~/components/ui/button"
import { getSessionInfo } from "~/service.server/session"

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSessionInfo(request)
  if (!session) {
    return redirect("/auth")
  }

  // URLのパスを取得
  const url = new URL(request.url)
  const path = url.pathname

  // ユーザータイプに基づいてリダイレクト
  if (session.userType === "teacher") {
    // 教師用ページへのアクセスを許可
    if (!path.startsWith("/teacher")) {
      return redirect("/teacher")
    }
  } else {
    // 生徒用ページへのアクセスを許可
    if (!path.startsWith("/student")) {
      return redirect("/student")
    }
  }

  return json({ userType: session.userType })
}

export default function AppLayout() {
  const { userType } = useLoaderData<typeof loader>()
  const location = useLocation()
  const isRootPath = location.pathname === "/student" || location.pathname === "/teacher"

  return (
    <div>
      {/* ナビゲーションバー */}
      <nav className="h-16 border-b">
        <div className="container mx-auto flex h-full items-center justify-between px-4">
          <div className="flex items-center gap-4">
            {isRootPath ? (
              <Link to={userType === "teacher" ? "/teacher" : "/student"}>
                <h1 className="text-xl font-bold">ClassWallet.js</h1>
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => window.history.back()}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 hover:bg-gray-100"
              >
                ←
              </button>
            )}
          </div>

          <div className="flex items-center gap-4">
            <Form action="/auth/logout" method="post">
              <Button variant="outline" type="submit">
                ログアウト
              </Button>
            </Form>
          </div>
        </div>
      </nav>

      {/* メインコンテンツ */}
      <main className="min-h-[calc(100vh-4rem)] bg-gray-50">
        <Outlet />
      </main>
    </div>
  )
}
