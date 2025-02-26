import { type LoaderFunctionArgs } from "@remix-run/node"
import { Link, useLoaderData, useOutletContext } from "@remix-run/react"
import { useEffect } from "react"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { AppContextType } from "~/routes/_app"
import { prisma } from "~/service.server/repository"
import { getSessionInfo } from "~/service.server/session"

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { success, sessionData } = await getSessionInfo(request)
  if (!success) throw new Error("Unauthorized")

  const walletId = params.walletId
  if (!walletId) throw new Error("Wallet ID is required")

  const wallet = await prisma.wallet.findUnique({
    where: { id: walletId },
    include: {
      parts: {
        include: {
          users: {
            include: {
              user: true,
            },
          },
          purchases: {
            include: {
              requestedBy: true,
              approvedByAccountant: true,
              approvedByTeacher: true,
            },
          },
        },
      },
      teachers: true,
    },
  })

  if (!wallet) {
    throw new Response("Wallet not found", { status: 404 })
  }

  // 教師が担当クラスにアクセスしているか確認
  const isTeacherOfWallet = wallet.teachers.some((t) => t.teacherId === sessionData.userId)
  if (!isTeacherOfWallet) throw new Error("Unauthorized")

  return { wallet }
}

export default function WalletDetail() {
  const { wallet } = useLoaderData<typeof loader>()
  const { setBackRoute } = useOutletContext<AppContextType>()
  useEffect(() => {
    setBackRoute("/teacher")
  }, [setBackRoute])
  return (
    <div className="container mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">{wallet.name}</h1>
      </div>
      <div className="space-y-8">
        {wallet.parts.map((part) => (
          <Link to={`/teacher/part/${part.id}`} className="block" key={part.id}>
            <Card>
              <CardHeader>
                <CardTitle>{part.name}</CardTitle>
                <CardDescription>
                  メンバー数: {part.users.length}名 / 購入リクエスト: {part.purchases.length}件
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="mb-2 font-semibold">最近の購入リクエスト</h3>
                    <div className="space-y-2">
                      {part.purchases.slice(0, 3).map((purchase) => (
                        <div key={purchase.id} className="rounded border p-3">
                          <div className="mb-2 flex items-center justify-between">
                            <p className="font-medium">{purchase.itemName}</p>
                            <span className="font-bold">¥{purchase.amount}</span>
                          </div>
                          <div className="space-y-1 text-sm text-gray-600">
                            <p>申請者: {purchase.requestedBy.name}</p>
                            <p>
                              会計承認:{" "}
                              {purchase.approvedByAccountant ? (
                                <span className="text-green-600">✓ {purchase.approvedByAccountant.name}</span>
                              ) : (
                                <span className="text-red-600">✗ 未承認</span>
                              )}
                            </p>
                            <p>
                              教師承認:{" "}
                              {purchase.approvedByTeacher ? (
                                <span className="text-green-600">✓ {purchase.approvedByTeacher.name}</span>
                              ) : (
                                <span className="text-red-600">✗ 未承認</span>
                              )}
                            </p>
                          </div>
                          <Link to={`/teacher/request/${purchase.id}`} className="mt-2 block">
                            <Button size="sm" variant="outline" className="w-full">
                              詳細を見る
                            </Button>
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
