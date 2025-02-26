import { type LoaderFunctionArgs, json, redirect } from "@remix-run/node"
import { Link, useLoaderData, useOutletContext } from "@remix-run/react"
import { useEffect } from "react"

import { PartMemberCard } from "~/components/part-member-card"
import { PartTeachersCard } from "~/components/part-teachers-card"
import { RequestCard } from "~/components/request-card"
import { Button } from "~/components/ui/button"

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
  return json({ userPart, userParts })
}

export default function PartDetail() {
  const { userPart, userParts } = useLoaderData<typeof loader>()
  const { part } = userPart
  const { setBackRoute } = useOutletContext<AppContextType>()

  useEffect(() => {
    setBackRoute("/student")
  }, [setBackRoute])
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
        <PartMemberCard userParts={userParts} />
        <PartTeachersCard part={part} />
        <div className="col-span-1 sm:col-span-2">
          <RequestCard part={part} />
        </div>
      </div>
    </div>
  )
}
