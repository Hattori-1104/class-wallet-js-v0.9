import { Product, Purchase, PurchaseItem, User } from "@prisma/client"
import { Part } from "@prisma/client"
import { ContainerSection } from "~/components/container"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card"

type RequestCardProps = {
  purchase: Pick<Purchase, "id" | "note"> & {
    requestedBy: Pick<User, "name" | "email">
    approvedByAccountant: Pick<User, "name" | "email"> | null
    approvedByTeacher: Pick<User, "name" | "email"> | null
    items: (Pick<PurchaseItem, "id" | "amount"> & { product: Pick<Product, "name"> })[]
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

export function RequestCard({ purchase }: RequestCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <p>購入者: {purchase.requestedBy.name}</p>
        <p>承認者: {purchase.approvedByAccountant?.name || "未承認"}</p>
        <p>承認者: {purchase.approvedByTeacher?.name || "未承認"}</p>
        {purchase.items.map((item) => (
          <p key={item.id}>
            {item.product.name} {item.amount}円
          </p>
        ))}
      </CardContent>
    </Card>
  )
}
