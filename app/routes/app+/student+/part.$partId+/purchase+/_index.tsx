import { Prisma } from "@prisma/client"
import { LoaderFunctionArgs } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import { Container, ContainerSection } from "~/components/common/container"
import { requirePart } from "~/services/loader.utils.server"
import { repository } from "~/services/repository.server"

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const partId = requirePart(params)
  const purchases = await repository(
    async (prisma) =>
      await prisma.purchase.findMany({
        where: {
          part: {
            id: partId,
          },
        },
        select: {
          id: true,
          note: true,
          items: {
            select: {
              id: true,
              quantity: true,
              product: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                },
              },
            },
          },
          requestCert: {
            select: {
              signedBy: {
                select: {
                  id: true,
                  name: true,
                },
              },
              approved: true,
            },
          },
          accountantCert: {
            select: {
              signedBy: {
                select: {
                  id: true,
                  name: true,
                },
              },
              approved: true,
            },
          },
          teacherCert: {
            select: {
              signedBy: {
                select: {
                  id: true,
                  name: true,
                },
              },
              approved: true,
            },
          },
          returnedAt: true,
          actualUsage: true,
        },
      }),
    `/app/student/part/${partId}`,
  )
  return { purchases }
}

function getPurchaseStatus(
  purchase: Prisma.PurchaseGetPayload<{
    select: {
      requestCert: {
        select: {
          approved: true
        }
      }
      accountantCert: {
        select: {
          approved: true
        }
      }
      teacherCert: {
        select: {
          approved: true
        }
      }
      actualUsage: true
      returnedAt: true
    }
  }>,
) {
  if (!purchase.requestCert.approved) return "リクエスト取り消し済み"
  if (!purchase.accountantCert) return "会計承認待ち"
  if (!purchase.accountantCert.approved) return "会計承認拒否"
  if (!purchase.teacherCert) return "教師承認待ち"
  if (!purchase.teacherCert.approved) return "教師承認拒否"
  if (!purchase.actualUsage) return "買い出し中"
  return purchase.returnedAt ? "完了" : "残金返却待ち"
}

export default function Request() {
  const { purchases } = useLoaderData<typeof loader>()
  return (
    <Container>
      <ContainerSection title="リクエスト一覧">
        {purchases.map((purchase) => (
          <div key={purchase.id} className="p-6 border rounded-lg shadow">
            <div>{purchase.note}</div>
            <div>{getPurchaseStatus(purchase)}</div>
          </div>
        ))}
      </ContainerSection>
    </Container>
  )
}
