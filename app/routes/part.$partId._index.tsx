import { LoaderFunctionArgs } from "@remix-run/node"
import { Link, useLoaderData } from "@remix-run/react"
import { Button } from "~/components/ui/button"
import { db } from "~/service.server/repository"

import { getSession } from "~/service.server/session"

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  // ユーザーIDの取得
  const session = await getSession(request.headers.get("Cookie"))
  const userId = session.get("userId")
  if (userId === undefined) throw new Error("セッションにユーザーが存在しない")

  // パートIDの取得
  const partId = Number(params.partId)
  if (Number.isNaN(partId)) throw new Error("パートIDの形式が不適切")

  // パートの取得 ＆ ユーザーの取得
  const currentSession = await db.userPosition.findFirst({
    where: { userId, partId },
    select: { part: { select: { id: true, name: true } }, user: { select: { id: true, name: true } } },
  })
  if (currentSession === null) throw new Error("データベースにパートとユーザーの組み合わせが存在しない")
  return { currentSession }
}

export default function PartPage() {
  const { currentSession } = useLoaderData<typeof loader>()
  return (
    <div>
      <div>{currentSession.part.name}</div>
    </div>
  )
}
