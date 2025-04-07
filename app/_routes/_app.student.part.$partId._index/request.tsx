import { Product, Purchase, PurchaseItem, User } from "@prisma/client"
import { Part } from "@prisma/client"
import { Link } from "@remix-run/react"
import { Check, ChevronRightIcon, X } from "lucide-react"
import { ContainerSection } from "~/components/common/container"
import { Badge } from "~/components/ui/badge"
import { Card, CardContent } from "~/components/ui/card"
import { getTotalPrice } from "~/lib/calc"
import { formatMoney } from "~/lib/utils"

type RequestCardItemProps = {
  item: Pick<PurchaseItem, "id" | "amount"> & { product: Pick<Product, "id" | "name" | "price"> }
}

type RequestCardProps = {
  purchase: Pick<Purchase, "id" | "note" | "completedAt" | "createdAt"> & {
    part: Pick<Part, "id">
    requestedBy: Pick<User, "name" | "email">
    approvedByAccountant: Pick<User, "name" | "email"> | null
    approvedByTeacher: Pick<User, "name" | "email"> | null
    items: RequestCardItemProps["item"][]
  }
}

type RequestSectionProps = {
  part: Pick<Part, "id" | "name"> & {
    purchases: RequestCardProps["purchase"][]
  }
}

export function RequestSection({ part }: RequestSectionProps) {
  return (
    <ContainerSection title="購入リクエスト一覧">
      <div className="space-y-4">
        {part.purchases.map((purchase) => (
          <RequestCard purchase={purchase} key={purchase.id} />
        ))}
      </div>
    </ContainerSection>
  )
}

function RequestCard({ purchase }: RequestCardProps) {
  return (
    <Link to={`/student/part/${purchase.part.id}/request/${purchase.id}`} className="block">
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex flex-row justify-between items-center">
            <div>
              <p className="text-lg font-bold">{purchase.note}</p>
              <p className="text-sm text-muted-foreground">{purchase.requestedBy.name}</p>
            </div>
            <div className="text-lg font-bold text-right">{formatMoney(getTotalPrice({ purchase }))}</div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {purchase.items.map((item) => (
              <RequestCardItem key={item.id} item={item} />
            ))}
          </div>
          <div className="inline-flex flex-row justify-start items-center w-full flex-wrap gap-1">
            {purchase.approvedByAccountant ? (
              <Badge variant="default">
                <Check size={12} className="mr-1" />
                {purchase.approvedByAccountant.name}
              </Badge>
            ) : (
              <Badge variant="secondary">
                <X size={12} className="mr-1" />
                会計承認
              </Badge>
            )}
            <ChevronRightIcon className="w-4 h-4" />
            {purchase.approvedByTeacher ? (
              <Badge variant="default">
                <Check size={12} className="mr-1" />
                {purchase.approvedByTeacher.name}
              </Badge>
            ) : (
              <Badge variant="secondary">
                <X size={12} className="mr-1" />
                教師承認
              </Badge>
            )}
            <ChevronRightIcon className="w-4 h-4" />
            {purchase.completedAt ? (
              <Badge variant="default">
                <Check size={12} className="mr-1" />
                {purchase.requestedBy.name}
              </Badge>
            ) : (
              <Badge variant="secondary">
                <X size={12} className="mr-1" />
                購入
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

function RequestCardItem({ item }: { item: RequestCardItemProps["item"] }) {
  return (
    <div className="flex flex-row gap-4 items-center justify-between w-auto border rounded p-3">
      <div>
        <p className="leading-snug">{item.product.name}</p>
        <p className="text-sm text-muted-foreground leading-none">{formatMoney(item.product.price)}</p>
      </div>
      <p className="text-sm leading-none">×{item.amount}</p>
    </div>
  )
}
