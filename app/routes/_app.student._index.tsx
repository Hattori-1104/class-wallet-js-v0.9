import { type LoaderFunctionArgs, json, redirect } from "@remix-run/node"
import { Link, useLoaderData } from "@remix-run/react"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { prisma } from "~/service.server/db"
import { destroySessionInfo, getSessionInfo } from "~/service.server/session"

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSessionInfo(request)
  if (!session) throw new Error("Unauthorized")

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      userParts: {
        include: {
          part: {
            include: {
              wallet: true,
            },
          },
          role: true,
        },
      },
      userWallets: {
        include: {
          wallet: {
            include: {
              parts: true,
              teachers: {
                include: {
                  teacher: true,
                },
              },
            },
          },
        },
      },
    },
  })
  if (!user) {
    // セッションを削除してログインページにリダイレクト
    const cookie = await destroySessionInfo(request)
    throw redirect("/auth", {
      headers: {
        "Set-Cookie": cookie,
      },
    })
  }

  return json({ user })
}

export default function StudentIndex() {
  const { user } = useLoaderData<typeof loader>()

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-6 text-2xl font-bold">生徒ダッシュボード</h1>

      <div className="grid gap-6">
        {/* クラス一覧 */}
        <section>
          <h2 className="mb-4 text-xl font-semibold">所属クラス</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {user.userWallets.map(({ wallet }) => (
              <Card key={wallet.id}>
                <CardHeader>
                  <CardTitle>{wallet.name}</CardTitle>
                  <CardDescription>担当教師: {wallet.teachers.map((t) => t.teacher.name).join(", ")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">パート数: {wallet.parts.length}個</p>
                    <Link to={`/student/wallet/${wallet.id}`}>
                      <Button variant="outline" size="sm" className="w-full">
                        詳細を見る
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* 担当パート */}
        <section>
          <h2 className="mb-4 text-xl font-semibold">担当パート</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {user.userParts.map(({ part, role }) => (
              <Card key={part.id}>
                <CardHeader>
                  <CardTitle>{part.name}</CardTitle>
                  <CardDescription>
                    所属: {part.wallet.name}
                    <br />
                    役職: {role.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Link to={`/student/part/${part.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          詳細を見る
                        </Button>
                      </Link>
                      {role.name === "会計" && (
                        <Link to={`/student/part/${part.id}/manage`} className="flex-1">
                          <Button size="sm" className="w-full">
                            会計管理
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
