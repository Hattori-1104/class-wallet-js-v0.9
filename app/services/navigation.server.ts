import { redirect } from "@remix-run/node"
import { commitSession, getSession } from "./session.server"

// エラーハンドリングは仮です！！！！
export const escapeError = (url: string) => {
  return redirect(`${url}?error`)
}
