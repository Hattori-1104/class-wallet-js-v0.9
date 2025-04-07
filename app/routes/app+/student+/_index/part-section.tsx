import { Prisma } from "@prisma/client"
import { Link } from "@remix-run/react"
import { ContainerSection } from "~/components/common/container"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"

type PartSectionProps = {
  parts: Prisma.PartGetPayload<{
    select: {
      id: true
      name: true
      leaders: { select: { id: true; name: true } }
      wallet: { select: { id: true; name: true } }
    }
  }>[]
}

export function PartSection({ parts }: PartSectionProps) {
  return (
    <ContainerSection title="担当パート">
      {parts.map((part) => (
        <Link to={`/app/student/part/${part.id}`} key={part.id}>
          <Card>
            <CardHeader className="flex flex-row justify-between space-y-0">
              <CardTitle>{part.name}</CardTitle>
              <CardDescription>{part.wallet.name}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc space-y-2">
                {part.leaders.length > 0 ? (
                  part.leaders.map((leader) => (
                    <li key={leader.id} className="flex justify-between items-center">
                      <div className="text-sm text-muted-foreground">パート責任者</div>
                      <div>{leader.name}</div>
                    </li>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground">パート責任者がいません</div>
                )}
              </ul>
            </CardContent>
          </Card>
        </Link>
      ))}
    </ContainerSection>
  )
}
