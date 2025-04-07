import { Params } from "@remix-run/react"
import { getSession } from "~/services/session.server"
import { escapeError } from "./navigation.server"
import { repository } from "./repository.server"

// 1. セッションの値を取得
// 2. データベースに存在を確認
// 3. IDのみを返す
export async function requireStudent(request: Request) {
  const session = await getSession(request.headers.get("Cookie"))
  const sessionUser = session.get("user")
  if (!sessionUser) {
    throw escapeError("/auth")
  }
  if (sessionUser.type !== "student") {
    throw escapeError("/auth")
  }
  const { id } = await repository(
    async (prisma) =>
      prisma.student.findUniqueOrThrow({
        where: { id: sessionUser.id },
        select: {
          id: true,
        },
      }),
    "/auth",
  )
  return id
}

export function requirePart(params: Params<string>) {
  const partId = params.partId
  if (!partId) {
    throw escapeError("/auth")
  }
  return partId
}

export function requirePurchase(params: Params<string>) {
  const purchaseId = params.purchaseId
  if (!purchaseId) {
    throw escapeError("/auth")
  }
  return purchaseId
}
