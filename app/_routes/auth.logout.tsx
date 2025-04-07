import { type ActionFunctionArgs, type LoaderFunctionArgs, redirect } from "@remix-run/node"
import { destroySessionInfo } from "~/service.server/session"

// どちらもログアウトとして処理
export const action = async ({ request }: ActionFunctionArgs) => {
  return redirect("/auth", { headers: { "Set-Cookie": await destroySessionInfo(request, true) } })
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  return redirect("/auth", { headers: { "Set-Cookie": await destroySessionInfo(request, true) } })
}
