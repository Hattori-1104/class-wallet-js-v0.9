import { type LoaderFunctionArgs, redirect } from "@remix-run/node"
import { Link, useLoaderData, useOutletContext } from "@remix-run/react"
import { useEffect } from "react"
import { Container, ContainerGrid, ContainerSection, ContainerTitle } from "~/components/common/container"

import { Button } from "~/components/ui/button"

import { PartMemberCard } from "./member-card"
import { RequestSection } from "./request"
import { PartTeachersCard } from "./teachers-card"

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
        select: {
          id: true,
          name: true,
          wallet: {
            select: {
              id: true,
              name: true,
              teachers: {
                select: {
                  teacher: true,
                },
              },
            },
          },
          purchases: {
            select: {
              id: true,
              note: true,
              completedAt: true,
              createdAt: true,
              part: {
                select: {
                  id: true,
                },
              },
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
  return { userPart, userParts }
}

export default function PartDetail() {
  const { userPart, userParts } = useLoaderData<typeof loader>()
  const { part } = userPart
  const { setBackRoute } = useOutletContext<AppContextType>()
  useEffect(() => {
    setBackRoute("/student")
  }, [setBackRoute])
  return (
    <Container>
      <ContainerTitle className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl">{part.name}</h1>
          <p className="text-sm font-normal text-muted-foreground">所属 - {part.wallet.name}</p>
        </div>
        <Link to={`/student/part/${part.id}/request/new`}>
          <Button>購入リクエスト</Button>
        </Link>
      </ContainerTitle>

      <ContainerGrid>
        <PartMemberCard userParts={userParts} />
        <PartTeachersCard part={part} />
      </ContainerGrid>
      <RequestSection part={part} />
    </Container>
  )
}
