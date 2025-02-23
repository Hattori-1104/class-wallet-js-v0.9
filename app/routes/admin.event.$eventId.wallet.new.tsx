import { ActionFunctionArgs, type LoaderFunctionArgs, json, redirect } from "@remix-run/node"
import { Form, Link, useFetcher, useLoaderData } from "@remix-run/react"
import { useState } from "react"
import { FormEvent } from "react"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Input } from "~/components/ui/input"
import { Slider } from "~/components/ui/slider"
import { prisma } from "~/service.server/repository"

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const { eventId } = params

  const event = await prisma.event.findUnique({ where: { id: eventId } })
  if (!event) {
    throw new Error("イベントが存在しません")
  }
  return json({ event })
}

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const { eventId } = params
  const formData = await request.formData()
  const name = formData.get("name")
  const budgetLimit = formData.get("budgetLimit")

  const wallet = await prisma.wallet.create({
    data: { name: name as string, budgetLimit: Number(budgetLimit), eventId: eventId as string },
  })
  return redirect(`/admin/event/${eventId}`)
}

export default function AdminEventWalletNew() {
  const { event } = useLoaderData<typeof loader>()
  const fetcher = useFetcher()
  const [walletData, setWalletData] = useState({ name: "", budgetLimit: 0 })

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!walletData.name) {
      alert("ウォレット名を入力してください")
      return
    }

    if (walletData.budgetLimit <= 0) {
      alert("予算限度額は0より大きい値を入力してください")
      return
    }

    if (walletData.budgetLimit > event.budgetLimit) {
      alert("予算限度額がイベントの予算限度額を超えています")
      return
    }
    fetcher.submit(
      {
        name: walletData.name,
        budgetLimit: walletData.budgetLimit,
      },
      { method: "post" },
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-lg mx-auto">
        <CardHeader>
          <CardTitle>ウォレット作成</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                ウォレット名
              </label>
              <Input
                name="name"
                id="name"
                value={walletData.name}
                onChange={(e) => setWalletData({ ...walletData, name: e.target.value })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="budgetLimit" className="block text-sm font-medium text-gray-700">
                予算限度額
              </label>
              <Slider
                name="budgetLimit"
                defaultValue={[walletData.budgetLimit]}
                max={event?.budgetLimit}
                step={100}
                value={[walletData.budgetLimit]}
                onValueChange={(e) => setWalletData({ ...walletData, budgetLimit: e[0] })}
                className="mt-2"
              />
              <Input
                name="budgetLimit"
                type="number"
                value={walletData.budgetLimit}
                onChange={(e) => setWalletData({ ...walletData, budgetLimit: Number(e.target.value) })}
                className="mt-2 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline">
                <Link to={`/admin/event/${event.id}`}>キャンセル</Link>
              </Button>
              <Button type="submit">作成</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
