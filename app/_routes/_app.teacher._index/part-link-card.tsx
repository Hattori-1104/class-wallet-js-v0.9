import { Part, Wallet } from "@prisma/client"
import { Link } from "@remix-run/react"
import { Card, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"

type PartLinkCardProps = {
  part: Pick<Part, "id" | "name"> & { _count: { users: number } }
}

export function PartLinkCard({ part }: PartLinkCardProps) {
  return (
    <Link to={`/teacher/part/${part.id}`} className="w-full block" key={part.id}>
      <Card>
        <CardHeader>
          <CardTitle>{part.name}</CardTitle>
          <CardDescription>{part._count.users}人</CardDescription>
        </CardHeader>
      </Card>
    </Link>
  )
}
