import { type LoaderFunctionArgs, redirect } from "@remix-run/node"
import { prisma } from "~/service.server/repository"
import { commitSession, commitToastByCase, getSession } from "~/service.server/session"

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  // パラメーターを取得
  const { partId } = params
  const url = new URL(request.url)
  const accountant = Number(url.searchParams.get("accountant"))
  const session = await getSession(request.headers.get("Cookie"))
  const userId = session.get("userId")
  const userType = session.get("userType")

  // ログインしていない場合はログインページへリダイレクト
  if (userId === undefined || userType !== "student") {
    return redirect("/auth/student/login", {
      headers: { "Set-Cookie": await commitToastByCase(session, "UnAuthorized") },
    })
  }

  // パートが見つからない場合はエラーメッセージを表示してリダイレクト
  if (partId === undefined) {
    return redirect("/student", {
      headers: { "Set-Cookie": await commitToastByCase(session, "NotFound") },
    })
  }

  // 会計担当者の値が不正な場合は警告メッセージを表示してリダイレクト
  if (![0, 1].includes(accountant)) {
    return redirect("/student", {
      headers: { "Set-Cookie": await commitToastByCase(session, "NotAccountant") },
    })
  }

  // ここエラーハンドリングしてないです！！！！
  // ユーザーのパート情報を作成
  await prisma.userPart.create({
    data: {
      userId,
      partId,
      roleId: accountant,
    },
  })

  // 生徒のダッシュボードへリダイレクト
  return redirect("/student")
}
