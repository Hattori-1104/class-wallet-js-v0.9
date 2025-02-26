import { Part, Wallet } from "@prisma/client"
import { Teacher } from "@prisma/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"

type PartTeachersCardProps = {
  part: Part & { wallet: Wallet & { teachers: { teacher: Teacher }[] } }
}

export function PartTeachersCard({ part }: PartTeachersCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>担当教師</CardTitle>
        <CardDescription>クラスの担当教師</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {part.wallet.teachers.map(({ teacher }) => (
            <div key={teacher.id} className="flex items-center justify-between rounded border p-3">
              <div>
                <p className="font-medium">{teacher.name}</p>
                <p className="text-sm text-gray-600">{teacher.email}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
