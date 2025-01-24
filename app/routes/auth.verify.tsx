import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node"
import { Form, redirect, useLoaderData } from "@remix-run/react"
import { Button } from "~/components/ui/button"
import { db } from "~/service.server/repository"
import { commitSession } from "~/service.server/session"
import { getSession } from "~/service.server/session"

export const action = async ({ request }: ActionFunctionArgs) => {
  const session = await getSession(request.headers.get("Cookie"))
  const formData = await request.formData()
  const userId = Number(formData.get("userId")) || 0
  session.set("userId", userId)
  return redirect("/", {
    headers: { "Set-Cookie": await commitSession(session) },
  })
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const users = await db.user.findMany({ select: { id: true, name: true } })
  const session = await getSession(request.headers.get("Cookie"))
  const currentUserId = session.get("userId") || 0
  return { users, currentUserId }
}

export default function AuthVerifyPage() {
  const { users, currentUserId } = useLoaderData<typeof loader>()
  return (
    <div>
      <Form method="post">
        <h1>セッション作成</h1>
        {users.map((user) => (
          <Button key={user.id} type="submit" name="userId" value={user.id} variant={currentUserId === user.id ? "default" : "outline"}>
            {user.id}
          </Button>
        ))}
      </Form>
    </div>
  )
}
