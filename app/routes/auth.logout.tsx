import { type ActionFunctionArgs, redirect } from "@remix-run/node"
import { destroySessionInfo, getSessionInfo } from "~/service.server/session"

export async function action({ request }: ActionFunctionArgs) {
  const session = await getSessionInfo(request)
  if (!session) {
    return redirect("/auth")
  }

  // セッションを破棄してログアウト
  const cookie = await destroySessionInfo(request)
  return redirect("/auth", {
    headers: {
      "Set-Cookie": cookie,
    },
  })
}

// GETリクエストは認証ページにリダイレクト
export async function loader() {
  return redirect("/auth")
}
