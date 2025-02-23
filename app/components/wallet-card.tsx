import type { Wallet } from "@prisma/client"
import { Link } from "@remix-run/react"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"

interface WalletCardProps {
  wallet: Wallet & {
    parts: {
      id: string
      name: string
      users: { user: { id: string; name: string }; role: { name: string } }[]
      purchaseRequests: {
        id: string
        itemName: string
        amount: number
        requestedBy: { name: string }
        approvedByAccountant?: { name: string }
        approvedByTeacher?: { name: string }
      }[]
    }[]
  }
}

export function WalletCard({ wallet }: WalletCardProps) {
  return (
    <div className="space-y-8">
      {wallet.parts.map((part) => (
        <Link to={`/teacher/part/${part.id}`} className="block" key={part.id}>
          <Card>
            <CardHeader>
              <CardTitle>{part.name}</CardTitle>
              <CardDescription>
                メンバー数: {part.users.length}名 / 購入リクエスト: {part.purchaseRequests.length}件
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="mb-2 font-semibold">メンバー</h3>
                  <div className="grid gap-2 md:grid-cols-2">
                    {part.users.map(({ user, role }) => (
                      <div key={user.id} className="rounded border p-2">
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-gray-600">{role.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="mb-2 font-semibold">最近の購入リクエスト</h3>
                  <div className="space-y-2">
                    {part.purchaseRequests.slice(0, 3).map((request) => (
                      <div key={request.id} className="rounded border p-3">
                        <div className="mb-2 flex items-center justify-between">
                          <p className="font-medium">{request.itemName}</p>
                          <span className="font-bold">¥{request.amount}</span>
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p>申請者: {request.requestedBy.name}</p>
                          <p>
                            会計承認:{" "}
                            {request.approvedByAccountant ? (
                              <span className="text-green-600">✓ {request.approvedByAccountant.name}</span>
                            ) : (
                              <span className="text-red-600">✗ 未承認</span>
                            )}
                          </p>
                          <p>
                            教師承認:{" "}
                            {request.approvedByTeacher ? (
                              <span className="text-green-600">✓ {request.approvedByTeacher.name}</span>
                            ) : (
                              <span className="text-red-600">✗ 未承認</span>
                            )}
                          </p>
                        </div>
                        <Link to={`/teacher/request/${request.id}`} className="mt-2 block">
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
  )
}
