import { type LoaderFunctionArgs, json, redirect } from "@remix-run/node"
import { Link, useLoaderData } from "@remix-run/react"
import { Button } from "~/components/ui/button"
import { getSessionInfo } from "~/service.server/session"

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSessionInfo(request)

  // セッションがある場合は適切なページにリダイレクト
  if (session) {
    const path = session.userType === "teacher" ? "/teacher" : "/student"
    return redirect(path)
  }

  return json({
    isAuthenticated: false,
  })
}

export default function Auth() {
  const { isAuthenticated } = useLoaderData<typeof loader>()

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-6 text-2xl font-bold">認証ページ（開発用）</h1>

      {isAuthenticated ? (
        <div className="mb-4 rounded border border-green-500 bg-green-100 p-4">
          <p>認証済みです</p>
          <Link to="/app">
            <Button className="mt-2">アプリケーションへ</Button>
          </Link>
        </div>
      ) : (
        <div className="mb-4 rounded border border-yellow-500 bg-yellow-100 p-4">
          <p>セッションなし</p>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <h2 className="mb-2 text-xl font-semibold">開発用セッション作成</h2>
          <div className="flex flex-col gap-2">
            <Link to="/auth/dev/user-a">
              <Button className="w-full">田中太郎としてログイン</Button>
            </Link>
            <Link to="/auth/dev/user-b">
              <Button className="w-full">山田花子としてログイン</Button>
            </Link>
            <Link to="/auth/dev/user-c">
              <Button className="w-full">鈴木一郎としてログイン</Button>
            </Link>
            <Link to="/auth/dev/teacher">
              <Button className="w-full">山田先生としてログイン</Button>
            </Link>
          </div>
        </div>

        <div>
          <h2 className="mb-2 text-xl font-semibold">本番用認証</h2>
          <div className="flex flex-col gap-2">
            <Link to="/auth/login">
              <Button variant="outline" className="w-full">
                ログインページへ
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
