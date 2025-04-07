import { Prisma } from "@prisma/client"
import { Link } from "@remix-run/react"
import { ContainerSection } from "~/components/common/container"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { formatMoney } from "~/utils/display"

type RequestSectionProps = {
  part: Prisma.PartGetPayload<{
    select: {
      id: true
      purchases: {
        select: {
          id: true
          note: true
          requestCert: {
            select: {
              signedBy: {
                select: {
                  id: true
                  name: true
                }
              }
              approved: true
            }
          }
          accountantCert: {
            select: {
              signedBy: {
                select: {
                  id: true
                  name: true
                }
              }
              approved: true
            }
          }
          teacherCert: {
            select: {
              signedBy: {
                select: {
                  id: true
                  name: true
                }
              }
              approved: true
            }
          }
          returnedAt: true
          actualUsage: true
          items: {
            select: {
              id: true
              quantity: true
              product: {
                select: {
                  id: true
                  name: true
                  price: true
                }
              }
            }
          }
        }
      }
    }
  }>
}

export function RequestSection({ part }: RequestSectionProps) {
  return (
    <ContainerSection title="進行中のリクエスト">
      <div className="flex flex-col gap-4">
        {part.purchases.map((purchase) => (
          <Link to={`/app/student/part/${part.id}/purchase/${purchase.id}`} key={purchase.id}>
            <div className="p-6 border rounded-lg shadow space-y-4">
              <div>
                <div className="flex flex-row justify-between items-center">
                  <div>
                    <CardTitle>{purchase.note}</CardTitle>
                    <CardDescription>{purchase.requestCert.signedBy.name}</CardDescription>
                  </div>
                  <div className="text-lg font-semibold">{formatMoney(purchase.items.reduce((acc, item) => acc + item.quantity * item.product.price, 0))}</div>
                </div>
              </div>
              <div>
                <div className="grid grid-cols-1 gap-6 desk:grid-cols-2 sm:grid-cols-3">
                  {purchase.items.map((item) => (
                    <RequestItem key={item.id} item={item} />
                  ))}
                </div>
              </div>
              <div>
                {!purchase.requestCert.approved
                  ? "リクエスト取り消し済み"
                  : !purchase.accountantCert
                    ? "会計承認待ち"
                    : !purchase.accountantCert.approved
                      ? "会計承認拒否"
                      : !purchase.teacherCert
                        ? "教師承認待ち"
                        : !purchase.teacherCert.approved
                          ? "教師承認拒否"
                          : !purchase.actualUsage
                            ? "買い出し中"
                            : !purchase.returnedAt
                              ? "返却待ち"
                              : "完了"}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </ContainerSection>
  )
}

type RequestItemProps = {
  item: RequestSectionProps["part"]["purchases"][number]["items"][number]
}

export function RequestItem({ item }: RequestItemProps) {
  return (
    <div className="p-3 border rounded-md">
      <div className="flex flex-row justify-between items-center">
        <div>
          <div>{item.product.name}</div>
          <div className="text-sm text-muted-foreground">{formatMoney(item.product.price)}</div>
        </div>
        <div>{`×${item.quantity}`}</div>
      </div>
    </div>
  )
}
