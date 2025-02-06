import { type ActionFunctionArgs, type LoaderFunctionArgs, json } from "@remix-run/node"
import { Form, Link, useLoaderData, useParams } from "@remix-run/react"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { prisma } from "~/service.server/db"
import { getSessionInfo } from "~/service.server/session"

export async function loader({ request, params }: LoaderFunctionArgs) {
  const session = await getSessionInfo(request)
  if (!session) throw new Error("Unauthorized")

  const partId = params.partId
  if (!partId) throw new Error("Part ID is required")

  // パートのメンバーかどうかを確認
  const userPart = await prisma.userPart.findFirst({
    where: {
      userId: session.userId,
      partId: partId,
    },
  })

  if (!userPart) {
    throw new Error("このパートのメンバーではありません")
  }

  const purchases = await prisma.purchase.findMany({
    where: { partId },
    include: {
      approvedByAccountant: true,
      approvedByTeacher: true,
      requestedBy: true,
    },
    orderBy: { createdAt: "desc" },
  })

  return json({ purchases })
}

export async function action({ request, params }: ActionFunctionArgs) {
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

  return json({ success: true })
}

export default function ManagePurchase() {
  const { purchases } = useLoaderData<typeof loader>()

  return (
    <div className="container mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">購入リクエスト</h1>
      </div>

      {/* 新規購入リクエストフォーム */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>新規購入リクエスト</CardTitle>
          <CardDescription>購入したい商品の情報を入力してください</CardDescription>
        </CardHeader>
        <CardContent>
          <Form method="post" className="space-y-4">
            <div>
              <Label htmlFor="itemName">商品名</Label>
              <Input id="itemName" name="itemName" required />
            </div>
            <div>
              <Label htmlFor="amount">金額</Label>
              <Input id="amount" name="amount" type="number" required />
            </div>
            <div>
              <Label htmlFor="description">説明</Label>
              <Input id="description" name="description" required />
            </div>
            <Button type="submit">リクエスト送信</Button>
          </Form>
        </CardContent>
      </Card>

      {/* リクエスト一覧 */}
      <Card>
        <CardHeader>
          <CardTitle>購入リクエスト一覧</CardTitle>
          <CardDescription>承認状況を確認できます</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {purchases.map((purchase) => (
              <div key={purchase.id} className="rounded border p-4">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="font-medium">{purchase.itemName}</h3>
                  <span className="text-lg font-bold">¥{purchase.amount}</span>
                </div>
                <p className="text-sm text-gray-600">{purchase.description}</p>
                <div className="mt-2 flex gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">会計承認:</span>
                    {purchase.approvedByAccountant ? (
                      <span className="text-green-600">✓ {purchase.approvedByAccountant.name}</span>
                    ) : (
                      <span className="text-red-600">✗ 未承認</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">教師承認:</span>
                    {purchase.approvedByTeacher ? (
                      <span className="text-green-600">✓ {purchase.approvedByTeacher.name}</span>
                    ) : (
                      <span className="text-red-600">✗ 未承認</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
