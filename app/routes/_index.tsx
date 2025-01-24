import { LoaderFunctionArgs } from "@remix-run/node"
import { Link, json, useLoaderData } from "@remix-run/react"
import { Button } from "~/components/ui/button"
import { getSession } from "~/service.server/session"

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const session = await getSession(request.headers.get("Cookie"))
  const userId = session.get("userId")
  return json({ userId })
}

export default function TopPage() {
  const { userId } = useLoaderData<typeof loader>()
  return (
    <div>
      <p>UserId : {userId}</p>
      <Button>
        <Link to="/auth/verify">認証確認ページ</Link>
      </Button>
      <Button>
        <Link to="/part">パート一覧ページ</Link>
      </Button>
    </div>
  )
}
