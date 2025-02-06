import { Form } from "@remix-run/react"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { type ActionFunctionArgs, json, redirect } from "@remix-run/node"
import { getSession, commitSession } from "~/service.server/session"
import { prisma } from "~/service.server/db"

export default function TeacherLogin() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md mx-auto p-6 bg-white shadow-md rounded-md">
        <h1 className="text-3xl font-bold mb-6 text-center">教師ログイン</h1>
        <Form method="post" className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              メールアドレス
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              パスワード
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            ログイン
          </Button>
        </Form>
      </div>
    </div>
  )
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData()
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (password !== "dummyPass") {
    return json({ error: "パスワードが間違っています" }, { status: 401 })
  }

  const user = await prisma.teacher.findUnique({ where: { email } })
  if (!user) {
    return json({ error: "ユーザーが見つかりません" }, { status: 404 })
  }

  const session = await getSession(request.headers.get("Cookie"))
  session.set("userId", user.id)
  session.set("userType", "teacher")

  const headers = new Headers()
  headers.append("Set-Cookie", await commitSession(session))

  return redirect("/teacher", { headers })
} 