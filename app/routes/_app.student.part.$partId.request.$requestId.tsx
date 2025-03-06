import { type ActionFunctionArgs, type LoaderFunctionArgs, json, redirect } from "@remix-run/node"
import { Form, useLoaderData, useOutletContext } from "@remix-run/react"
import { useEffect } from "react"
import { Container } from "~/components/container"
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
    select: {
      part: {
        select: {
          name: true,
          users: {
            where: { userId },
            select: {
              roleId: true,
            },
          },
        },
      },
      requestedBy: true,
      approvedByAccountant: true,
      approvedByTeacher: true,
      items: {
        select: {
          product: {
            select: {
              name: true,
            },
          },
          amount: true,
        },
      },
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
    <Container>
      <div className="my-4">
        <h1 className="text-2xl font-bold">購入リクエスト詳細</h1>
      </div>
    </Container>
  )
}
