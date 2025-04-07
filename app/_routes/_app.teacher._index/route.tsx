import { LoaderFunctionArgs, redirect } from "@remix-run/node"
import { Link, useLoaderData } from "@remix-run/react"
import { Container, ContainerGrid, ContainerSection } from "~/components/common/container"
import { Card, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { getTotalPrice } from "~/lib/calc"
import { formatMoney } from "~/lib/utils"
import { prisma } from "~/service.server/repository"
import { destroySessionInfo, getSessionInfo } from "~/service.server/session"
import { PartLinkCard } from "./part-link-card"
import { WalletLinkCard } from "./wallet-link-card"

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { success, session } = await getSessionInfo(request)
  if (!success) return redirect("/auth", { headers: { "Set-Cookie": await destroySessionInfo(request) } })
  const userId = session.get("userId")

  const teacher = await prisma.teacher.findUnique({
    where: { id: userId },
    select: {
      wallets: {
        select: {
          wallet: {
            select: {
              id: true,
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
                  wallet: {
                    select: {
                      id: true,
                      name: true,
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
  const pendingPurchases = await prisma.purchase.findMany({
    where: {
      completedAt: null,
      approvedByTeacher: null,
      part: {
        wallet: {
          teachers: {
            some: {
              id: userId,
            },
          },
        },
      },
    },
    select: {
      part: {
        select: {
          id: true,
        },
      },
      id: true,
      note: true,
      requestedBy: {
        select: {
          name: true,
        },
      },
      items: {
        select: {
          product: {
            select: {
              price: true,
            },
          },
          amount: true,
        },
      },
    },
  })
  if (!teacher) return redirect("/auth", { headers: { "Set-Cookie": await destroySessionInfo(request) } })
  return { teacher, pendingPurchases }
}

export default function TeacherIndex() {
  const { teacher, pendingPurchases } = useLoaderData<typeof loader>()
  return (
    <Container title="教師ダッシュボード">
      <ContainerGrid>
        <ContainerSection title="担当ウォレット">
          <div className="space-y-4">
            {teacher.wallets.map(({ wallet }) => (
              <WalletLinkCard wallet={wallet} key={wallet.id} />
            ))}
          </div>
        </ContainerSection>
      </ContainerGrid>
      {pendingPurchases.length > 0 && (
        <ContainerSection title={`${pendingPurchases.length}件の承認待ち購入リクエスト`}>
          <div className="space-y-4">
            {pendingPurchases.map((purchase) => (
              <Card key={purchase.id}>
                <CardHeader>
                  <Link to={`/teacher/request/${purchase.id}`} className="flex flex-row justify-between items-center">
                    <div>
                      <p className="text-lg font-bold">{purchase.note}</p>
                      <p className="text-sm text-muted-foreground">{purchase.requestedBy.name}</p>
                    </div>
                    <div className="text-lg font-bold text-right">{formatMoney(getTotalPrice({ purchase }))}</div>
                  </Link>
                </CardHeader>
              </Card>
            ))}
          </div>
        </ContainerSection>
      )}
    </Container>
  )
}
