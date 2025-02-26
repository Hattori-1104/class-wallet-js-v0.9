import { Purchase, User } from "@prisma/client"
import { Part } from "@prisma/client"
import { Link } from "@remix-run/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"

type RequestCardProps = {
  part: Pick<Part, "id" | "name"> & {
    purchases: (Pick<Purchase, "id"> & {
      requestedBy: Pick<User, "name">
      approvedByAccountant: Pick<User, "name"> | null
      approvedByTeacher: Pick<User, "name"> | null
    })[]
  }
}

export function RequestCard({ part }: RequestCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>購入リクエスト一覧</CardTitle>
        <CardDescription>パートメンバーからの購入リクエスト履歴</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {part.purchases.map((purchase) => (
            <div key={purchase.id}>
              <Link to={`/student/part/${part.id}/request/${purchase.id}`}>
                <div className="space-y-2 border rounded p-4">{purchase.requestedBy.name}</div>
                {/* {ここから} */}
              </Link>
            </div>
          ))}
          {part.purchases.length === 0 && <p className="text-center text-gray-500">購入リクエストはありません</p>}
        </div>
      </CardContent>
    </Card>
  )
}
