import { type ActionFunctionArgs, json, redirect } from "@remix-run/node"
import { Form, useActionData } from "@remix-run/react"
import { useState } from "react"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { prisma } from "~/service.server/db"
import { getSessionInfo } from "~/service.server/session"

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const session = await getSessionInfo(request)
  if (!session) throw new Error("Unauthorized")

  const partId = params.partId
  if (!partId) throw new Error("Part ID is required")

  const formData = await request.formData()
  const itemName = formData.get("itemName") as string
  const amount = Number(formData.get("amount"))
  const description = formData.get("description") as string

  await prisma.purchase.create({
    data: {
      itemName,
      amount,
      description,
      partId,
      requestedById: session.userId,
    },
  })

  return redirect(`/student/part/${partId}`)
}

export default function NewPurchaseRequest() {
  const actionData = useActionData<{ error?: string }>()
  const [itemName, setItemName] = useState("")
  const [amount, setAmount] = useState(0)
  const [description, setDescription] = useState("")

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">新規購入リクエスト</h1>
      <Form method="post" className="space-y-4">
        {actionData?.error && <p className="text-red-500">{actionData.error}</p>}
        <div>
          <label htmlFor="itemName" className="block text-sm font-medium text-gray-700">
            商品名
          </label>
          <Input id="itemName" name="itemName" value={itemName} onChange={(e) => setItemName(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
            金額
          </label>
          <Input id="amount" name="amount" type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} required />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            説明
          </label>
          <Input id="description" name="description" value={description} onChange={(e) => setDescription(e.target.value)} required />
        </div>
        <Button type="submit">リクエスト送信</Button>
      </Form>
    </div>
  )
}
