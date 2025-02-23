import type { Part, Teacher, User, UserPart } from "@prisma/client"
import { type LoaderFunctionArgs, json, redirect } from "@remix-run/node"
import { Link, useLoaderData, useNavigate, useOutletContext } from "@remix-run/react"
import { Check, X } from "lucide-react"
import { useEffect } from "react"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "~/components/ui/drawer"
import { Progress } from "~/components/ui/progress"
import { ScrollArea } from "~/components/ui/scroll-area"
import { AppContextType } from "~/routes/_app"
import { prisma } from "~/service.server/repository"
import { commitToastByCase, destroySessionInfo, getSessionInfo } from "~/service.server/session"
export async function loader({ request, params }: LoaderFunctionArgs) {
  const { success, session, sessionData } = await getSessionInfo(request)
  if (!success) return redirect("/auth", { headers: { "Set-Cookie": await destroySessionInfo(request) } })

  const userId = sessionData.userId

  const partId = params.partId
  if (partId === undefined) return redirect("/student", { headers: { "Set-Cookie": await commitToastByCase(session, "InvalidURL") } })

  // userPartテーブルを使用してパートの詳細情報を取得
  const userPart = await prisma.userPart.findFirst({
    where: { partId, userId },
    select: {
      roleId: true,
      part: {
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
  const userParts = await prisma.userPart.findMany({
    where: { partId },
    select: {
      roleId: true,
      user: true,
    },
  })
  if (!userPart) return redirect("/student", { headers: { "Set-Cookie": await commitToastByCase(session, "NotFound") } })
  if (userParts.length === 0) return redirect("/student", { headers: { "Set-Cookie": await commitToastByCase(session, "NotFound") } })
  return json({ userPart, userParts, partId })
}

export default function PartDetail() {
  const { userPart, userParts, partId } = useLoaderData<typeof loader>()
  const { user, part, roleId } = userPart
  const { setBackRoute } = useOutletContext<AppContextType>()

  useEffect(() => {
    setBackRoute("/student")
  }, [setBackRoute])
  const procedures = [
    { name: "購入申請", fullfilled: true },
    { name: "会計承認", fullfilled: false },
    { name: "教師承認", fullfilled: false },
    { name: "購入中", fullfilled: false },
    { name: "購入完了", fullfilled: false },
  ]
  return (
    <div className="container mx-auto p-4">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{part.name}</h1>
          <p className="text-gray-600">所属: {part.wallet.name}</p>
        </div>
        <Link to={`/student/part/${part.id}/request/new`}>
          <Button>購入リクエスト</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* メンバー一覧 */}
        <Drawer>
          <DrawerTrigger asChild>
            <Card>
              <CardHeader>
                <CardTitle>メンバー</CardTitle>
                <CardDescription>パートに所属するメンバーと役職</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {userParts
                    .filter(({ roleId }) => roleId === 1 || roleId === 2)
                    .sort((a, b) => b.roleId - a.roleId)
                    .map(({ user, roleId }) => (
                      <div key={user.id} className="flex items-center justify-between rounded border p-3">
                        <div className="flex flex-row items-center justify-between grow">
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-gray-600">{user.email}</p>
                          </div>
                          {
                            [
                              <Badge key={0} variant="outline">
                                メンバー
                              </Badge>,
                              <Badge key={1} variant="secondary">
                                副会計
                              </Badge>,
                              <Badge key={2} variant="default">
                                会計
                              </Badge>,
                            ][roleId]
                          }
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>すべてのメンバー</DrawerTitle>
              <DrawerDescription>パートに所属するメンバーと役職</DrawerDescription>
            </DrawerHeader>
            <ScrollArea className="max-h-[80vh] overflow-y-auto">
              {userParts
                .sort((a, b) => b.roleId - a.roleId - a.roleId)
                .map(({ user, roleId }) => (
                  <div key={user.id} className="flex items-center justify-between border-t p-3">
                    <div className="flex flex-row items-center justify-between w-full">
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                      {
                        [
                          <Badge key={0} variant="outline">
                            メンバー
                          </Badge>,
                          <Badge key={1} variant="secondary">
                            副会計
                          </Badge>,
                          <Badge key={2} variant="default">
                            会計
                          </Badge>,
                        ][roleId]
                      }
                    </div>
                  </div>
                ))}
            </ScrollArea>
          </DrawerContent>
        </Drawer>

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

        {/* 購入リクエスト一覧 */}
        <Card className="col-span-1 sm:col-span-2">
          <CardHeader>
            <CardTitle>購入リクエスト一覧</CardTitle>
            <CardDescription>パートメンバーからの購入リクエスト履歴</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {part.purchases.map((request) => (
                <div key={request.id}>
                  <Link to={`/student/part/${part.id}/request/${request.id}`}>
                    <div className="space-y-2 border rounded p-4">
                      <p>test</p>
                      <div className="flex flex-row w-full justify-between gap-2">
                        {procedures.map((procedure) => (
                          <div key={procedure.name} className="text-center grow border py-2">
                            <p>{procedure.name}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
              {part.purchases.length === 0 && <p className="text-center text-gray-500">購入リクエストはありません</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
