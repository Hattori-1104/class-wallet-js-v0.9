import { type LoaderFunctionArgs, redirect } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import { Container, ContainerGrid, ContainerSection, ContainerTitle } from "~/components/common/container"
import { prisma } from "~/service.server/repository"
import { destroySessionInfo, getSessionInfo } from "~/service.server/session"
import { PartLinkCard } from "./part-link-card"
import { WalletLinkCard } from "./wallet-link-card"

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { success, session } = await getSessionInfo(request)
  if (!success) return redirect("/auth/student/login", { headers: { "Set-Cookie": await destroySessionInfo(request) } })
  const userId = session.get("userId")

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      userParts: {
        select: {
          part: {
            include: {
              wallet: {
                select: {
                  id: true,
                  name: true,
                  teachers: {
                    select: {
                      teacher: true,
                    },
                  },
                  parts: {
                    include: {
                      users: {
                        select: {
                          user: {
                            select: {
                              id: true,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  })
  // ユーザー情報が見つからない場合はログアウト処理を行う
  if (!user) return redirect("/auth", { headers: { "Set-Cookie": await destroySessionInfo(request) } })

  return { user }
}

export default function StudentIndex() {
  const { user } = useLoaderData<typeof loader>()
  const wallets = Array.from(new Map(user.userParts.map(({ part }) => [part.walletId, part.wallet])).values())

  return (
    <Container title="生徒ダッシュボード">
      <ContainerGrid>
        <ContainerSection title="担当パート">
          <div className="space-y-4">
            {user.userParts.map(({ part }) => (
              <PartLinkCard part={part} key={part.id} />
            ))}
          </div>
        </ContainerSection>
        <ContainerSection title="所属ウォレット">
          <div className="space-y-4">
            {wallets.map((wallet) => (
              <WalletLinkCard wallet={wallet} key={wallet.id} />
            ))}
          </div>
        </ContainerSection>
      </ContainerGrid>
    </Container>
  )
}
