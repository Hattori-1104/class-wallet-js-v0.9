import type { Part, Teacher, User, UserPart } from "@prisma/client"
import { type LoaderFunctionArgs, json } from "@remix-run/node"
import { Link, useLoaderData } from "@remix-run/react"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { prisma } from "~/service.server/db"
import { getSessionInfo } from "~/service.server/session"

export async function loader({ request, params }: LoaderFunctionArgs) {
  const session = await getSessionInfo(request)
  if (!session) throw new Error("Unauthorized")
  const userId = session.userId
  if (!userId) throw new Error("Unauthorized")

  const partId = params.partId
  if (!partId) throw new Error("Part ID is required")

  // userPartテーブルを使用してパートの詳細情報を取得
  const userPart = await prisma.userPart.findFirst({
    where: { partId, userId },
    select: {
      roleId: true,
      part: {
        include: {
          users: {
            include: {
              user: true,
            },
          },
          wallet: {
            include: {
              teachers: {
                include: {
                  teacher: true,
                },
              },
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
      user: true,
    },
  })
  if (!userPart) throw new Error("Part not found")

  return json({ userPart })
}

export default function PartDetail() {
  const { userPart } = useLoaderData<typeof loader>()
  return (
    <div className="container mx-auto p-4">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{userPart.part.name}</h1>
          <p className="text-gray-600">所属: {userPart.part.wallet.name}</p>
        </div>
        <Link to={`/student/part/${userPart.part.id}/manage`}>
          <Button>購入リクエスト</Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* メンバー一覧 */}
        <Link to={`/student/part/${userPart.part.id}`} className="block" key={userPart.part.id}>
          <Card>
            <CardHeader>
              <CardTitle>メンバー一覧</CardTitle>
              <CardDescription>パートに所属するメンバーと役職</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userPart.part.users.map(({ user }) => (
                  <div key={user.id} className="flex items-center justify-between rounded border p-3">
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* 担当教師 */}
        <Link to={`/student/part/${userPart.part.id}`} className="block" key={userPart.part.id}>
          <Card>
            <CardHeader>
              <CardTitle>担当教師</CardTitle>
              <CardDescription>クラスの担当教師</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userPart.part.wallet.teachers.map((teacher) => (
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
        </Link>

        {/* 購入リクエスト一覧 */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>購入リクエスト一覧</CardTitle>
            <CardDescription>パートメンバーからの購入リクエスト履歴</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {userPart.part.purchases.map((request) => (
                <div key={request.id} className="flex items-center justify-between rounded border p-3">
                  <div>
                    <p className="font-medium">{request.itemName}</p>
                    <p className="text-sm text-gray-600">申請者: {request.requestedBy.name}</p>
                    <p className="text-sm text-gray-600">金額: ¥{request.amount.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">会計承認: {request.approvedByAccountant ? "承認済み" : "未承認"}</p>
                    <p className="text-sm text-gray-600">教師承認: {request.approvedByTeacher ? "承認済み" : "未承認"}</p>
                  </div>
                  <p className="text-sm text-gray-500">{new Date(request.createdAt).toLocaleDateString("ja-JP")}</p>
                </div>
              ))}
              {userPart.part.purchases.length === 0 && <p className="text-center text-gray-500">購入リクエストはありません</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
