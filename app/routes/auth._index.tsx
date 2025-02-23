import { Link, useOutletContext } from "@remix-run/react"
import { Button } from "~/components/ui/button"
import { AuthContextType } from "~/routes/auth"

export default function Auth() {
  const { sessionData } = useOutletContext<AuthContextType>()

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-6 text-2xl font-bold">認証ページ（開発用）</h1>

      {sessionData ? (
        <div className="mb-4 rounded border border-green-500 bg-green-100 p-4">
          <p>認証済みです</p>
          <Link to={sessionData.userType === "teacher" ? "/teacher" : "/student"}>
            <Button className="mt-2">アプリケーションへ</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="mb-4 rounded border border-yellow-500 bg-yellow-100 p-4">
            <p>セッションなし</p>
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="mb-2 text-xl font-semibold">生徒用</h2>
              <div className="flex flex-col gap-2">
                <Link to="/auth/student/login">
                  <Button variant="outline" className="w-full">
                    生徒ログイン
                  </Button>
                </Link>
                <Link to="/auth/student/register">
                  <Button variant="outline" className="w-full">
                    生徒登録
                  </Button>
                </Link>
              </div>
            </div>

            <div>
              <h2 className="mb-2 text-xl font-semibold">教師用</h2>
              <div className="flex flex-col gap-2">
                <Link to="/auth/teacher/login">
                  <Button className="w-full">教師ログイン</Button>
                </Link>
                <Link to="/auth/teacher/register">
                  <Button className="w-full">教師登録</Button>
                </Link>
              </div>
            </div>

            <div>
              <h2 className="mb-2 text-xl font-semibold">管理者用</h2>
              <div className="flex flex-col gap-2">
                <Link to="/admin">
                  <Button className="w-full">管理者ダッシュボード</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
