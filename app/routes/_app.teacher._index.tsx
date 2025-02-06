import { type LoaderFunctionArgs, json, redirect } from "@remix-run/node"
import { Link, useLoaderData } from "@remix-run/react"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { prisma } from "~/service.server/db"
import { destroySessionInfo, getSessionInfo } from "~/service.server/session"

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSessionInfo(request)
  if (!session) throw new Error("Unauthorized")
  if (session.userType !== "teacher") throw new Error("Unauthorized")

  const teacher = await prisma.teacher.findFirst({
    where: {
      id: session.userId,
    },
    include: {
      wallets: {
        include: {
          wallet: {
            select: {
              id: true,
              name: true,
              parts: {
                include: {
                  wallet: true,
                  purchases: {
                    where: {
                      OR: [{ accountantApprovalId: null }, { teacherApprovalId: null, accountantApprovalId: { not: null } }],
                    },
                    include: {
                      requestedBy: true,
                      approvedByAccountant: true,
                    },
                    orderBy: {
                      createdAt: "desc",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  })
  if (!teacher) {
    // セッションを削除してログインページにリダイレクト
    const cookie = await destroySessionInfo(request)
    throw redirect("/auth", {
      headers: {
        "Set-Cookie": cookie,
      },
    })
  }

  return json({ teacher })
}

export default function TeacherIndex() {
  const { teacher } = useLoaderData<typeof loader>()

  return (
    <div className="container mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">教師ダッシュボード</h1>
      </div>

      <div className="space-y-8">
        {/* 担当クラス */}
        <section>
          <h2 className="mb-4 text-xl font-semibold">担当クラス</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {teacher.wallets.map(({ wallet }) => (
              <Link to={`/teacher/wallet/${wallet.id}`} className="block" key={wallet.id}>
                <Card>
                  <CardHeader>
                    <CardTitle>{wallet.name}</CardTitle>
                    <CardDescription>所属パート一覧</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="space-y-1">
                        {wallet.parts.map((part) => (
                          <p key={part.id} className="text-sm text-gray-600">
                            • {part.name}
                          </p>
                        ))}
                        {wallet.parts.length === 0 && <p className="text-sm text-gray-500">パートがありません</p>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* 承認待ちの購入リクエスト */}
        <section>
          <h2 className="mb-4 text-xl font-semibold">承認待ちの購入リクエスト</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {teacher.wallets.flatMap(({ wallet }) =>
              wallet.parts.map((part) => (
                <Card key={part.id}>
                  <CardHeader>
                    <CardTitle>
                      {wallet.name}.{part.name}
                    </CardTitle>
                    <CardDescription>{part.purchases.length > 0 && <>承認待ちの購入リクエスト: {part.purchases.length}件</>}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {part.purchases.map((purchase) => (
                        <div key={purchase.id} className="rounded border p-3">
                          <div className="mb-2">
                            <div className="mb-1 flex items-center justify-between">
                              <p className="font-medium">{purchase.itemName}</p>
                              <span className="font-bold">¥{purchase.amount}</span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600">申請者: {purchase.requestedBy.name}</p>
                          <p className="text-sm text-gray-600">
                            会計承認:{" "}
                            {purchase.approvedByAccountant ? (
                              <span className="text-green-600">✓ {purchase.approvedByAccountant.name}</span>
                            ) : (
                              <span className="text-red-600">✗ 未承認</span>
                            )}
                          </p>
                          <Link to={`/teacher/request/${purchase.id}`} className="mt-2 block">
                            <Button size="sm" variant="outline" className="w-full">
                              詳細を見る
                            </Button>
                          </Link>
                        </div>
                      ))}
                      {part.purchases.length === 0 && <p className="text-center text-sm text-gray-500">承認待ちの購入リクエストはありません</p>}
                    </div>
                  </CardContent>
                </Card>
              )),
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
