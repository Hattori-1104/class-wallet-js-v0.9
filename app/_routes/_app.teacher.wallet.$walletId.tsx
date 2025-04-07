import { LoaderFunctionArgs, redirect } from "@remix-run/node"
import { useLoaderData, useOutletContext } from "@remix-run/react"
import { useEffect } from "react"
import { Container, ContainerGrid, ContainerSection } from "~/components/common/container"
import { prisma } from "~/service.server/repository"
import { commitToastByCase, destroySessionInfo, getSessionInfo } from "~/service.server/session"
import { AppContextType } from "./_app"
import { PartLinkCard } from "./_app.student._index/part-link-card"

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { success, session, sessionData } = await getSessionInfo(request)
  if (!success) return redirect("/auth", { headers: { "Set-Cookie": await destroySessionInfo(request) } })

  const walletId = params.walletId
  if (!walletId) return redirect("/teacher", { headers: { "Set-Cookie": await commitToastByCase(session, "InvalidURL") } })

  const wallet = await prisma.wallet.findUnique({
    where: { id: walletId },
    select: {
      name: true,
      parts: {
        select: {
          id: true,
          name: true,
          _count: {
            select: {
              users: true,
            },
          },
        },
      },
    },
  })
  if (!wallet) return redirect("/teacher", { headers: { "Set-Cookie": await commitToastByCase(session, "NotFound") } })

  return { wallet }
}
export default function TeacherWalletDetail() {
  const { wallet } = useLoaderData<typeof loader>()
  const { setBackRoute } = useOutletContext<AppContextType>()

  useEffect(() => {
    setBackRoute("/teacher")
  }, [setBackRoute])

  return (
    <Container title={wallet.name}>
      <ContainerSection title="パート一覧">
        <ContainerGrid>
          {wallet.parts.map((part) => (
            <PartLinkCard part={part} key={part.id} />
          ))}
        </ContainerGrid>
      </ContainerSection>
    </Container>
  )
}
