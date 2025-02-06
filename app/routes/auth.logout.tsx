import { type ActionFunctionArgs, redirect } from "@remix-run/node"
import { destroySessionInfo } from "~/service.server/session"

export const action = async ({ request }: ActionFunctionArgs) => {
  const session = await destroySessionInfo(request)
  return redirect("/auth", {
    headers: {
      "Set-Cookie": session,
    },
  })
}

// GETリクエストは認証ページにリダイレクト
export const loader = () => redirect("/auth")
