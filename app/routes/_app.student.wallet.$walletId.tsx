import { type LoaderFunctionArgs, json } from "@remix-run/node"
import { Link, useLoaderData } from "@remix-run/react"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { prisma } from "~/service.server/db"
import { getSessionInfo } from "~/service.server/session"

export async function loader({ request, params }: LoaderFunctionArgs) {
  const session = await getSessionInfo(request)
  if (!session) throw new Error("Unauthorized")

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
        },
      },
      teachers: {
        include: {
          teacher: true,
        },
      },
    },
  })
  if (!wallet) throw new Error("Wallet not found")

  return json({ wallet })
}

export default function WalletDetail() {
  const { wallet } = useLoaderData<typeof loader>()

  return (
    <div className="container mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">{wallet.name}</h1>
      </div>

      <div className="space-y-8">
        {/* パート一覧 */}
        {wallet.parts.map((part) => (
          <Link to={`/student/part/${part.id}`} key={part.id} className="block">
            <Card>
              <CardHeader>
                <CardTitle>{part.name}</CardTitle>
                <CardDescription>メンバー数: {part.users.length}名</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* メンバー一覧 */}
                  <div>
                    <h3 className="mb-2 font-semibold">メンバー</h3>
                    <div className="grid gap-2 md:grid-cols-2">
                      {part.users.map(({ user }) => (
                        <div key={user.id} className="rounded border p-2">
                          <p className="font-medium">{user.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}

        {/* 担当教師 */}
        <Card>
          <CardHeader>
            <CardTitle>担当教師</CardTitle>
            <CardDescription>クラスの担当教師</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {wallet.teachers.map((teacher) => (
                <div key={teacher.id} className="flex items-center justify-between rounded border p-3">
                  <div>
                    <p className="font-medium">{teacher.teacher.name}</p>
                    <p className="text-sm text-gray-600">{teacher.teacher.email}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
