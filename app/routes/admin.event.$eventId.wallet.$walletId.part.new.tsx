import { type ActionFunctionArgs, json, redirect } from "@remix-run/node"
import { type LoaderFunctionArgs } from "@remix-run/node"
import { Form, useActionData, useLoaderData } from "@remix-run/react"
import { useEffect, useState } from "react"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Slider } from "~/components/ui/slider"
import { prisma } from "~/service.server/db"

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const { walletId, eventId } = params
  const formData = await request.formData()
  const name = formData.get("name") as string
  const budgetLimit = Number(formData.get("budgetLimit"))

  if (!name || Number.isNaN(budgetLimit)) {
    return json({ error: "名前と予算上限は必須です" }, { status: 400 })
  }

  const wallet = await prisma.wallet.findUnique({
    where: { id: walletId as string },
    include: { parts: true },
  })

  if (!wallet) {
    return json({ error: "ウォレットが見つかりません" }, { status: 404 })
  }

  const totalPartsBudget = wallet.parts.reduce((sum, part) => sum + part.budgetLimit, 0)

  if (totalPartsBudget + budgetLimit > wallet.budgetLimit) {
    return json({ error: "パートの合計予算がウォレットの予算を超えています" }, { status: 400 })
  }

  await prisma.part.create({
    data: {
      name,
      budgetLimit,
      walletId: walletId as string,
    },
  })

  return redirect(`/admin/event/${eventId}`)
}

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const { walletId } = params
  const wallet = await prisma.wallet.findUnique({
    where: { id: walletId },
    select: { budgetLimit: true },
  })

  if (!wallet) {
    throw new Response("ウォレットが見つかりません", { status: 404 })
  }

  return json({ walletId, walletBudgetLimit: wallet.budgetLimit })
}

export default function NewPart() {
  const actionData = useActionData<{ error?: string }>()
  const { walletId, walletBudgetLimit } = useLoaderData<{ walletId: string; walletBudgetLimit: number }>()
  const [name, setName] = useState("")
  const [budgetLimit, setBudgetLimit] = useState(0)

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-lg mx-auto p-6 bg-white shadow-md rounded-md">
        <h1 className="text-3xl font-bold mb-6 text-center">新しいパートを作成</h1>
        <Form method="post" className="space-y-4">
          {actionData?.error && <p className="text-red-500">{actionData.error}</p>}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              パート名
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
            <label htmlFor="budgetLimit" className="block text-sm font-medium text-gray-700">
              予算上限
            </label>
            <Slider
              name="budgetLimit"
              defaultValue={[budgetLimit]}
              max={walletBudgetLimit}
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
