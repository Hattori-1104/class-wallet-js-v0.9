import { type ActionFunctionArgs, json, redirect } from "@remix-run/node"
import { Form, useActionData } from "@remix-run/react"
import { useState } from "react"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { prisma } from "~/service.server/db"

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData()
  const name = formData.get("name") as string
  const email = formData.get("email") as string

  if (!name || !email) {
    return json({ error: "名前とメールアドレスは必須です" }, { status: 400 })
  }

  try {
    await prisma.teacher.create({
      data: {
        name,
        email,
      },
    })
    return redirect("/admin/teachers")
  } catch (error) {
    return json({ error: "登録に失敗しました。メールアドレスが既に使用されている可能性があります。" }, { status: 400 })
  }
}

export default function NewTeacher() {
  const actionData = useActionData<{ error?: string }>()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-lg mx-auto p-6 bg-white shadow-md rounded-md">
        <h1 className="text-3xl font-bold mb-6 text-center">新しい教師を登録</h1>
        <Form method="post" className="space-y-4">
          {actionData?.error && <p className="text-red-500">{actionData.error}</p>}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              名前
            </label>
            <Input
              id="name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              メールアドレス
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            登録
          </Button>
        </Form>
      </div>
    </div>
  )
}
