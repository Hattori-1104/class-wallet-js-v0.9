import { ActionFunctionArgs, LoaderFunctionArgs, redirect } from "@remix-run/node"
import { Form, Link, useLoaderData } from "@remix-run/react"
import { ContainerCard } from "~/components/common/container"
import { commitSession, getSession } from "~/services/session.server"

import { Check, KeyRound } from "lucide-react"
import { Header } from "~/components/common/header"
import { Button } from "~/components/ui/button"
import { CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const session = await getSession(request.headers.get("Cookie"))
  const user = session.get("user")
  return { user }
}

export default function Auth() {
  const { user } = useLoaderData<typeof loader>()
  return (
    <>
      <Header />
      <div className="flex flex-col items-center justify-center h-full">
        <ContainerCard>
          <CardHeader>
            <CardTitle>ユーザー認証</CardTitle>
            <CardDescription>パスワード入力は必要ありません。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {user && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-1 text-green-500 font-semibold">
                  <Check size={16} />
                  認証済みです。
                </div>
                <Link to={`/app/${user.type}`}>
                  <Button className="w-full">ダッシュボードへ</Button>
                </Link>
              </div>
            )}
            <Form action="/auth/oauth" className="flex flex-col desk:flex-row gap-6">
              <Button type="submit" name="user-type" value="student" variant="google" className="w-full">
                <KeyRound className="size-4 mr-1" />
                生徒として認証
              </Button>
              <Button type="submit" name="user-type" value="teacher" variant="google" className="w-full">
                <KeyRound className="size-4 mr-1" />
                教師として認証
              </Button>
            </Form>
            <Form method="post">
              <Button type="submit" name="user-type" value="student" variant="outline" className="w-full">
                <KeyRound className="size-4 mr-1" />
                テストユーザーとして認証
              </Button>
            </Form>
          </CardContent>
        </ContainerCard>
      </div>
    </>
  )
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const session = await getSession(request.headers.get("Cookie"))
  session.set("user", {
    type: "student",
    id: "105926552011320383379",
  })
  return redirect("/app/student", { headers: { "Set-Cookie": await commitSession(session) } })
}
