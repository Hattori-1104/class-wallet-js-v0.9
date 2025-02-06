import { type LoaderFunctionArgs, redirect } from "@remix-run/node"
import { prisma } from "~/service.server/db"
import { getSession } from "~/service.server/session"

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { eventId, walletId, partId } = params
  const url = new URL(request.url)
  const accountant = Number(url.searchParams.get("accountant"))
  const session = await getSession(request.headers.get("Cookie"))
  const userId = session.get("userId")
  const userType = session.get("userType")
  if (!userId || userType !== "student") {
    return redirect("/auth/student/login") // ログインしていない場合はログインページへリダイレクト
  }

  if (!partId) {
    throw new Error("Part not found")
  }

  if (![0, 1].includes(accountant)) {
    throw new Error("Invalid accountant value")
  }

  console.log(accountant)

  await prisma.userPart.create({
    data: {
      userId: userId,
      partId: partId,
      roleId: accountant,
    },
  })

  // 生徒のダッシュボードへリダイレクト
  return redirect("/student")
}
