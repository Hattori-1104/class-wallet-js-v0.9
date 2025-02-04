import type { Part, Role, Teacher, User } from "@prisma/client"
import { type LoaderFunctionArgs, json } from "@remix-run/node"
import { Link, useLoaderData } from "@remix-run/react"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { prisma } from "~/service.server/db"
import { getSessionInfo } from "~/service.server/session"

export async function loader({ request, params }: LoaderFunctionArgs) {
  const session = await getSessionInfo(request)
  if (!session) throw new Error("Unauthorized")

  const partId = params.partId
  if (!partId) throw new Error("Part ID is required")

  // パートの詳細情報を取得
  const part = await prisma.part.findUnique({
    where: { id: partId },
    include: {
      wallet: {
        include: {
          teachers: {
            include: {
              teacher: true,
            },
          },
        },
      },
      users: {
        include: {
          user: true,
          role: true,
        },
      },
    },
  })
  if (!part) throw new Error("Part not found")

  // 現在のユーザーの役職を取得
  const userPart = part.users.find((up) => up.user.id === session.userId)
  if (!userPart) throw new Error("User is not a member of this part")

  return json({ part, currentUserRole: userPart.role })
}

export default function PartDetail() {
  const { part, currentUserRole } = useLoaderData<typeof loader>()
  return (
    <div className="container mx-auto p-4">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{part.name}</h1>
          <p className="text-gray-600">所属: {part.wallet.name}</p>
        </div>
        {currentUserRole.name === "会計" && (
          <Link to={`/student/part/${part.id}/manage`}>
            <Button>会計管理</Button>
          </Link>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* メンバー一覧 */}
        <Card>
          <CardHeader>
            <CardTitle>メンバー一覧</CardTitle>
            <CardDescription>パートに所属するメンバーと役職</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {part.users.map(({ user, role }) => (
                <div key={user.id} className="flex items-center justify-between rounded border p-3">
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-gray-600">{role.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 担当教師 */}
        <Card>
          <CardHeader>
            <CardTitle>担当教師</CardTitle>
            <CardDescription>クラスの担当教師</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {part.wallet.teachers.map((teacher) => (
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
