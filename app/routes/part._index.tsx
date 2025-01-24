import { LoaderFunctionArgs } from "@remix-run/node"
import { Link, useLoaderData } from "@remix-run/react"
import { Button } from "~/components/ui/button"
import { db } from "~/service.server/repository"
import { getSession } from "~/service.server/session"

export const loader = async ({ request }: LoaderFunctionArgs) => {
  // ユーザーIDの取得
  const session = await getSession(request.headers.get("Cookie"))
  const userId = session.get("userId")
  if (userId === undefined) throw new Error("セッションにユーザーが存在しない")
  const currentUser = await db.user.findUnique({ where: { id: userId } })
  if (currentUser === null) throw new Error("データベースにユーザーが存在しない")

  // ユーザーが所属するパートの取得
  const parts = (
    await db.userPosition.findMany({
      where: { userId },
      select: { part: { select: { id: true, name: true } } },
    })
  ).map(({ part }) => part)

  return { parts, currentUser }
}

export default function PartIndexPage() {
  const { parts, currentUser } = useLoaderData<typeof loader>()
  return (
    <div>
      <div>
        <h1>{currentUser.name}</h1>
      </div>
      {parts.map((part) => (
        <Button key={part.id}>
          <Link to={`/part/${part.id}`}>{part.name}</Link>
        </Button>
      ))}
    </div>
  )
}
