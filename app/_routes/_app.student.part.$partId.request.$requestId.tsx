import { type ActionFunctionArgs, type LoaderFunctionArgs, data, redirect } from "@remix-run/node"
import { Form, useLoaderData, useOutletContext } from "@remix-run/react"
import { useEffect } from "react"
import { Container } from "~/components/common/container"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Separator } from "~/components/ui/separator"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table"
import { formatMoney } from "~/lib/utils"
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

  const userPart = await prisma.userPart.findFirst({
    where: {
      partId,
      userId,
    },
    select: {
      roleId: true,
      part: {
        select: {
          id: true,
        },
      },
    },
  })
  if (userPart === null) return redirect(`/student/part/${params.partId}`, { headers: { "Set-Cookie": await commitToastByCase(session, "NotFound") } })

  const purchase = await prisma.purchase.findUnique({
    where: { id: requestId },
    select: {
      part: {
        select: {
          name: true,
          users: {
            where: {
              userId,
            },
            select: {
              roleId: true,
            },
          },
        },
      },
      note: true,
      requestedBy: {
        select: {
          name: true,
          email: true,
        },
      },
      approvedByAccountant: {
        select: {
          name: true,
          email: true,
        },
      },
      approvedByTeacher: {
        select: {
          name: true,
          email: true,
        },
      },
      items: {
        select: {
          id: true,
          product: {
            select: {
              id: true,
              name: true,
              price: true,
            },
          },
          amount: true,
        },
      },
    },
  })
  if (purchase === null)
    return redirect(`/student/part/${params.partId}`, {
      headers: { "Set-Cookie": await commitToastByCase(session, "NotFound") },
    })

  return { purchase, userPart }
}

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const { success, session, sessionData } = await getSessionInfo(request)
  if (!success) return redirect("/auth", { headers: { "Set-Cookie": await destroySessionInfo(request) } })

  const userId = sessionData.userId

  const requestId = params.requestId
  if (requestId === undefined)
    return redirect(`/student/part/${params.partId}`, { headers: { "Set-Cookie": await commitSession(setToast(session, "error", "URLが不正です")) } })

  const formData = await request.formData()
  const action = formData.get("action")
  if (["approve", "reject"].includes(action as string)) {
    // ユーザーが会計であるか確認
    const userPart = await prisma.userPart.findFirst({
      where: {
        userId,
        partId: params.partId,
        roleId: { in: [1, 2] },
      },
      select: {
        user: {
          select: {
            id: true,
          },
        },
      },
    })
    if (userPart === null) {
      // セッションを削除してログインページにリダイレクト
      return redirect("/auth", { headers: { "Set-Cookie": await commitToastByCase(session, "NotAccountant") } })
    }

    if (action === "approve") {
      await prisma.purchase.update({
        where: { id: requestId },
        data: {
          accountantApprovalId: userPart.user.id,
        },
      })
      return redirect(`/student/part/${params.partId}`, { headers: { "Set-Cookie": await commitToastByCase(session, "RequestApproved") } })
    }

    await prisma.$transaction(async (tx) => {
      await tx.purchaseItem.deleteMany({
        where: {
          purchaseId: requestId,
        },
      })
      await tx.purchase.delete({
        where: { id: requestId },
      })
      await tx.product.deleteMany({
        where: {
          purchaseItems: {
            none: {},
          },
          doesShare: false,
        },
      })
    })

    return redirect(`/student/part/${params.partId}`, { headers: { "Set-Cookie": await commitToastByCase(session, "RequestRejected") } })
  }
  if (["cancel", "complete"].includes(action as string)) {
    // ここから
  }
  return data(null, { headers: { "Set-Cookie": await commitToastByCase(session, "InvalidForm") } })
}

export default function RequestDetail() {
  const { purchase, userPart } = useLoaderData<typeof loader>()
  const { roleId, part } = userPart
  const { setBackRoute } = useOutletContext<AppContextType>()
  useEffect(() => {
    setBackRoute(`/student/part/${part.id}`)
  }, [setBackRoute, part.id])

  const isAccountant = [1, 2].includes(roleId)

  return (
    <Container title="購入リクエスト詳細">
      <Card>
        <CardHeader>
          <CardTitle>{purchase.note}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>商品名</TableHead>
                <TableHead className="text-right">単価</TableHead>
                <TableHead className="text-right">数量</TableHead>
                <TableHead className="text-right">小計</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchase.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.product.name}</TableCell>
                  <TableCell className="text-right">{formatMoney(item.product.price)}</TableCell>
                  <TableCell className="text-right">{item.amount}</TableCell>
                  <TableCell className="text-right">{formatMoney(item.product.price * item.amount)}</TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={3} className="text-right font-bold">
                  使用予定金額
                </TableCell>
                <TableCell className="text-right font-bold">
                  {formatMoney(purchase.items.reduce((acc, item) => acc + item.product.price * item.amount, 0))}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <Separator />
          <div className="space-y-2">
            <div className="border rounded p-3 flex flex-row justify-between items-center h-16">
              <div>
                <div className="font-medium">{purchase.requestedBy.name}</div>
                <div className="text-sm text-muted-foreground">{purchase.requestedBy.email}</div>
              </div>
              <Badge variant="default">リクエスト</Badge>
            </div>
            <div className="border rounded p-3 flex flex-row justify-between items-center h-16">
              <div>
                {purchase.approvedByAccountant ? (
                  <>
                    <div className="font-medium">{purchase.approvedByAccountant.name}</div>
                    <div className="text-sm text-muted-foreground">{purchase.approvedByAccountant.email}</div>
                  </>
                ) : (
                  <div className="font-medium italic">未承認</div>
                )}
              </div>
              <Badge variant="default">会計承認</Badge>
            </div>
            <div className="border rounded p-3 flex flex-row justify-between items-center h-16">
              <div>
                {purchase.approvedByTeacher ? (
                  <>
                    <div className="font-medium">{purchase.approvedByTeacher.name}</div>
                    <div className="text-sm text-muted-foreground">{purchase.approvedByTeacher.email}</div>
                  </>
                ) : (
                  <div className="font-medium italic">未承認</div>
                )}
              </div>
              <Badge variant="default">教師承認</Badge>
            </div>
          </div>
          <Separator />
          {isAccountant && !purchase.approvedByAccountant && (
            <Form method="post" className="flex flex-row gap-2">
              <Button type="submit" name="action" value="reject" variant="destructive" className="w-full">
                拒否
              </Button>
              <Button type="submit" name="action" value="approve" variant="default" className="w-full">
                承認
              </Button>
            </Form>
          )}
          {purchase.approvedByAccountant && purchase.approvedByTeacher && (
            <Form method="post" className="space-y-4">
              <div className="space-y-1">
                <Label>実際の使用金額</Label>
                <Input type="number" name="usedMoney" required />
              </div>
              <div className="flex flex-row gap-2">
                <Button type="submit" name="action" value="cancel" variant="destructive" className="w-full">
                  キャンセル
                </Button>
                <Button type="submit" name="action" value="complete" variant="default" className="w-full">
                  購入完了
                </Button>
              </div>
            </Form>
          )}
        </CardContent>
      </Card>
    </Container>
  )
}
