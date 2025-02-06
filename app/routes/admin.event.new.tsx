import { ActionFunctionArgs, json } from "@remix-run/node"
import { redirect } from "@remix-run/node"
import { Form, useActionData } from "@remix-run/react"
import { useState } from "react"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Slider } from "~/components/ui/slider"
import { prisma } from "~/service.server/db"

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData()
  const name = formData.get("name")
  const budgetLimit = formData.get("budgetLimit")
  if (!name || !budgetLimit) {
    return json({ error: "名前と予算上限は必須です" }, { status: 400 })
  }

  if (typeof name !== "string") {
    return json({ error: "名前は文字列である必要があります" }, { status: 400 })
  }

  const budgetLimitNumber = Number(budgetLimit)
  if (Number.isNaN(budgetLimitNumber)) {
    return json({ error: "予算上限は数値である必要があります" }, { status: 400 })
  }

  if (budgetLimitNumber < 0) {
    return json({ error: "予算上限は0以上である必要があります" }, { status: 400 })
  }

  const event = await prisma.event.create({
    data: { name: name as string, budgetLimit: Number(budgetLimit) },
  })
  return redirect(`/admin/event/${event.id}`)
}

export default function AdminEventNew() {
  const actionData = useActionData<typeof action>()
  const [budgetLimit, setBudgetLimit] = useState(0)

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-lg mx-auto p-6 bg-white shadow-md rounded-md">
        <h1 className="text-3xl font-bold mb-6 text-center">イベント作成</h1>
        <Form method="post" className="space-y-4">
          {actionData?.error && <p className="text-red-500">{actionData.error}</p>}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              イベント名
            </label>
            <Input
              id="name"
              name="name"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>
          <div>
            <label htmlFor="budgetLimit" className="block text-sm font-medium text-gray-700">
              予算上限
            </label>
            <Slider
              name="budgetLimit"
              defaultValue={[budgetLimit]}
              max={1000000}
              step={1000}
              value={[budgetLimit]}
              onValueChange={(value) => setBudgetLimit(value[0])}
              className="mt-2"
            />
            <Input
              id="budgetLimit"
              name="budgetLimit"
              type="number"
              value={budgetLimit}
              onChange={(e) => setBudgetLimit(Number(e.target.value))}
              className="mt-2 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            作成
          </Button>
        </Form>
      </div>
    </div>
  )
}
