import { LoaderFunctionArgs, redirect } from "@remix-run/node"
import { useLoaderData, useOutletContext } from "@remix-run/react"
import { useEffect } from "react"
import { Container } from "~/components/common/container"
import { prisma } from "~/service.server/repository"
import { commitToastByCase, destroySessionInfo, getSessionInfo } from "~/service.server/session"
import { AppContextType } from "./_app"

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { success, session, sessionData } = await getSessionInfo(request)
  if (!success) return redirect("/auth", { headers: { "Set-Cookie": await destroySessionInfo(request) } })

  const partId = params.partId
  if (!partId) return redirect("/teacher", { headers: { "Set-Cookie": await commitToastByCase(session, "InvalidURL") } })

  const part = await prisma.part.findUnique({
    where: { id: partId },
    select: {
      id: true,
      name: true,
      users: {
        select: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
      wallet: {
        select: {
          id: true,
        },
      },
    },
  })
  if (!part) return redirect("/teacher", { headers: { "Set-Cookie": await commitToastByCase(session, "NotFound") } })

  return { part }
}

export default function TeacherPartDetail() {
  const { part } = useLoaderData<typeof loader>()
  const { setBackRoute } = useOutletContext<AppContextType>()
  useEffect(() => {
    setBackRoute("/teacher")
  }, [setBackRoute])
  return <Container title={part.name}>Content</Container>
}
