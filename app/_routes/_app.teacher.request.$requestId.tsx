import { ActionFunctionArgs, LoaderFunctionArgs, data } from "@remix-run/node"
import { Form, redirect, useLoaderData, useOutletContext } from "@remix-run/react"
import { useEffect } from "react"
import { Container } from "~/components/common/container"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Separator } from "~/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table"
import { formatMoney } from "~/lib/utils"
import { prisma } from "~/service.server/repository"
import { commitToastByCase, destroySessionInfo, getSessionInfo } from "~/service.server/session"
import { AppContextType } from "./_app"

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { success, session } = await getSessionInfo(request)
  if (!success) return redirect("/auth", { headers: { "Set-Cookie": await destroySessionInfo(request) } })
  const requestId = params.requestId
  if (requestId === undefined) return redirect("/teacher", { headers: { "Set-Cookie": await commitToastByCase(session, "InvalidURL") } })

  const purchase = await prisma.purchase.findUnique({
    where: { id: requestId },
    select: {
      part: {
        select: {
          id: true,
          name: true,
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
  if (purchase === null) return redirect("/teacher", { headers: { "Set-Cookie": await commitToastByCase(session, "NotFound") } })
  return { purchase }
}

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const { success, session } = await getSessionInfo(request)
  if (!success) return redirect("/auth", { headers: { "Set-Cookie": await destroySessionInfo(request) } })
  const userId = session.get("userId")
  if (userId === null) return redirect("/auth", { headers: { "Set-Cookie": await destroySessionInfo(request) } })
  const requestId = params.requestId
  if (requestId === undefined) return redirect("/teacher", { headers: { "Set-Cookie": await commitToastByCase(session, "InvalidURL") } })

  const formData = await request.formData()
  const action = formData.get("action")
  if (!["approve", "reject"].includes(action as string)) {
    return data(null, { headers: { "Set-Cookie": await commitToastByCase(session, "InvalidForm") } })
  }

  if (action === "approve") {
    await prisma.purchase.update({
      where: { id: requestId },
      data: {
        approvedByTeacher: {
          connect: {
            id: userId,
          },
        },
      },
    })
    return redirect("/teacher", { headers: { "Set-Cookie": await commitToastByCase(session, "RequestApproved") } })
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
  return redirect("/teacher", { headers: { "Set-Cookie": await commitToastByCase(session, "RequestRejected") } })
}

export default function TeacherRequestDetail() {
  const { purchase } = useLoaderData<typeof loader>()
  const { setBackRoute } = useOutletContext<AppContextType>()
  useEffect(() => {
    setBackRoute("/teacher")
  }, [setBackRoute])
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
                <TableHead>単価</TableHead>
                <TableHead>数量</TableHead>
                <TableHead>小計</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchase.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.product.name}</TableCell>
                  <TableCell>{formatMoney(item.product.price)}</TableCell>
                  <TableCell>{item.amount}</TableCell>
                  <TableCell>{formatMoney(item.product.price * item.amount)}</TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={3} className="text-right font-bold">
                  合計金額
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
          {!purchase.approvedByAccountant && (
            <Form method="post" className="flex flex-row gap-2">
              <Button type="submit" name="action" value="reject" variant="destructive" className="w-full">
                拒否
              </Button>
              <Button type="submit" name="action" value="approve" variant="default" className="w-full">
                承認
              </Button>
            </Form>
          )}
        </CardContent>
      </Card>
    </Container>
  )
}
