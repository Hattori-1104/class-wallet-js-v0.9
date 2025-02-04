import { type ActionFunctionArgs, type LoaderFunctionArgs, json, redirect } from "@remix-run/node"
import { Form, useLoaderData } from "@remix-run/react"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { prisma } from "~/service.server/db"
import { destroySessionInfo, getSessionInfo } from "~/service.server/session"

export async function loader({ request, params }: LoaderFunctionArgs) {
  const session = await getSessionInfo(request)
  if (!session) throw new Error("Unauthorized")

  const requestId = params.requestId
  if (!requestId) throw new Error("Request ID is required")

  const purchaseRequest = await prisma.purchaseRequest.findUnique({
    where: { id: requestId },
    include: {
      part: {
        include: {
          wallet: {
            include: {
              teachers: true,
            },
          },
        },
      },
      requestedBy: true,
      approvedByAccountant: true,
      approvedByTeacher: true,
    },
  })
  if (!purchaseRequest) throw new Error("Request not found")

  // 教師が担当クラスのリクエストにアクセスしているか確認
  const isTeacherOfWallet = purchaseRequest.part.wallet.teachers.some((t) => t.id === session.userId)
  if (!isTeacherOfWallet) {
    // セッションを削除してログインページにリダイレクト
    const cookie = await destroySessionInfo(request)
    throw redirect("/auth", {
      headers: {
        "Set-Cookie": cookie,
      },
    })
  }

  return json({ purchaseRequest })
}

export async function action({ request, params }: ActionFunctionArgs) {
  const session = await getSessionInfo(request)
  if (!session) throw new Error("Unauthorized")

  const requestId = params.requestId
  if (!requestId) throw new Error("Request ID is required")

  const formData = await request.formData()
  const action = formData.get("action")

  // 教師情報を取得
  const teacher = await prisma.teacher.findUnique({
    where: { id: session.userId },
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

  if (action === "approve") {
    await prisma.purchaseRequest.update({
      where: { id: requestId },
      data: {
        teacherApprovalId: teacher.id,
      },
    })
  } else if (action === "reject") {
    await prisma.purchaseRequest.delete({
      where: { id: requestId },
    })
  }

  return redirect("/teacher")
}

export default function RequestDetail() {
  const { purchaseRequest } = useLoaderData<typeof loader>()

  return (
    <div className="container mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">購入リクエスト詳細</h1>
      </div>

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>{purchaseRequest.itemName}</CardTitle>
            <CardDescription>
              {purchaseRequest.part.name} / {purchaseRequest.part.wallet.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* リクエスト情報 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">金額</span>
                  <span className="text-xl font-bold">¥{purchaseRequest.amount}</span>
                </div>
                <div>
                  <span className="font-medium">説明</span>
                  <p className="mt-1 whitespace-pre-wrap rounded bg-gray-50 p-3">{purchaseRequest.description}</p>
                </div>
              </div>

              {/* 申請・承認情報 */}
              <div className="space-y-2">
                <div>
                  <span className="font-medium">申請者</span>
                  <p className="mt-1">{purchaseRequest.requestedBy.name}</p>
                </div>
                <div>
                  <span className="font-medium">会計承認</span>
                  <p className="mt-1">
                    {purchaseRequest.approvedByAccountant ? (
                      <span className="text-green-600">✓ {purchaseRequest.approvedByAccountant.name}</span>
                    ) : (
                      <span className="text-red-600">✗ 未承認</span>
                    )}
                  </p>
                </div>
                <div>
                  <span className="font-medium">教師承認</span>
                  <p className="mt-1">
                    {purchaseRequest.approvedByTeacher ? (
                      <span className="text-green-600">✓ {purchaseRequest.approvedByTeacher.name}</span>
                    ) : (
                      <span className="text-red-600">✗ 未承認</span>
                    )}
                  </p>
                </div>
              </div>

              {/* 承認・却下ボタン */}
              {!purchaseRequest.approvedByTeacher && (
                <div className="flex gap-4">
                  <Form method="post" className="flex-1">
                    <input type="hidden" name="action" value="approve" />
                    <Button type="submit" className="w-full">
                      承認する
                    </Button>
                  </Form>
                  <Form method="post" className="flex-1">
                    <input type="hidden" name="action" value="reject" />
                    <Button type="submit" variant="destructive" className="w-full">
                      却下する
                    </Button>
                  </Form>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
