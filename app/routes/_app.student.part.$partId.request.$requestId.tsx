import { type ActionFunctionArgs, type LoaderFunctionArgs, json, redirect } from "@remix-run/node"
import { Form, useLoaderData, useOutletContext } from "@remix-run/react"
import { useEffect } from "react"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { requestFormSchema } from "~/lib/validations/request"
import { AppContextType } from "~/routes/_app"
import { prisma } from "~/service.server/repository"
import { commitSession, commitToastByCase, destroySessionInfo, getSessionInfo, setToast } from "~/service.server/session"
export async function loader({ request, params }: LoaderFunctionArgs) {
  const { success, session, sessionData } = await getSessionInfo(request)
  if (!success) return redirect("/auth", { headers: { "Set-Cookie": await destroySessionInfo(request) } })

  const userId = sessionData.userId

  const requestId = params.requestId
  if (requestId === undefined) return redirect(`/student/part/${params.partId}`, { headers: { "Set-Cookie": await commitToastByCase(session, "InvalidURL") } })
  const partId = params.partId
  if (partId === undefined) return redirect(`/student/part/${params.partId}`, { headers: { "Set-Cookie": await commitToastByCase(session, "InvalidURL") } })

  const purchase = await prisma.purchase.findUnique({
    where: { id: requestId },
    include: {
      part: {
        include: {
          users: {
            where: { userId },
          },
        },
      },
      requestedBy: true,
      approvedByAccountant: true,
      approvedByTeacher: true,
    },
  })
  if (purchase === null)
    return redirect(`/student/part/${params.partId}`, {
      headers: { "Set-Cookie": await commitSession(setToast(session, "error", "リクエストが見つかりません")) },
    })

  return json({ purchase, partId })
}

export async function action({ request, params }: ActionFunctionArgs) {
  const { success, session, sessionData } = await getSessionInfo(request)
  if (!success) return redirect("/auth", { headers: { "Set-Cookie": await destroySessionInfo(request) } })

  const userId = sessionData.userId

  const requestId = params.requestId
  if (requestId === undefined)
    return redirect(`/student/part/${params.partId}`, { headers: { "Set-Cookie": await commitSession(setToast(session, "error", "URLが不正です")) } })

  const { success: formSuccess, data: formData } = requestFormSchema.safeParse(await request.formData())
  if (!formSuccess) {
    return json(null, { headers: { "Set-Cookie": await commitToastByCase(session, "InvalidForm") } })
  }

  // ユーザーが会計であるか確認
  const userPart = await prisma.userPart.findFirst({
    where: {
      userId,
      partId: params.partId,
      roleId: 1,
    },
    select: {
      userId: true,
    },
  })
  if (userPart === null) {
    // セッションを削除してログインページにリダイレクト
    return redirect("/auth", { headers: { "Set-Cookie": await commitToastByCase(session, "NotAccountant") } })
  }

  if (formData.action === "approve") {
    await prisma.purchase.update({
      where: { id: requestId },
      data: {
        accountantApprovalId: userPart.userId,
      },
    })
  } else if (formData.action === "reject") {
    await prisma.purchase.delete({
      where: { id: requestId },
    })
  }

  return redirect(`/student/part/${params.partId}`)
}

export default function RequestDetail() {
  const { purchase, partId } = useLoaderData<typeof loader>()
  const { setBackRoute } = useOutletContext<AppContextType>()
  useEffect(() => {
    setBackRoute(`/student/part/${partId}`)
  }, [setBackRoute, partId])

  return (
    <div className="container mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">購入リクエスト詳細</h1>
      </div>

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>{purchase.itemName}</CardTitle>
            <CardDescription>{purchase.part.name}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* リクエスト情報 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">金額</span>
                  <span className="text-xl font-bold">¥{purchase.amount}</span>
                </div>
                <div>
                  <span className="font-medium">説明</span>
                  <p className="mt-1 whitespace-pre-wrap rounded bg-gray-50 p-3">{purchase.description}</p>
                </div>
              </div>

              {/* 申請・承認情報 */}
              <div className="space-y-2">
                <div>
                  <span className="font-medium">申請者</span>
                  <p className="mt-1">{purchase.requestedBy.name}</p>
                </div>
                <div>
                  <span className="font-medium">会計承認</span>
                  <p className="mt-1">
                    {purchase.approvedByAccountant ? (
                      <span className="text-green-600">✓ {purchase.approvedByAccountant.name}</span>
                    ) : (
                      <span className="text-red-600">✗ 未承認</span>
                    )}
                  </p>
                </div>
                <div>
                  <span className="font-medium">教師承認</span>
                  <p className="mt-1">
                    {purchase.approvedByTeacher ? (
                      <span className="text-green-600">✓ {purchase.approvedByTeacher.name}</span>
                    ) : (
                      <span className="text-red-600">✗ 未承認</span>
                    )}
                  </p>
                </div>
              </div>

              {/* 承認・却下ボタン */}
              {!purchase.approvedByAccountant && (
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
