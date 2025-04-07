import { Part, Teacher, User, Wallet } from "@prisma/client"
import { Link } from "@remix-run/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"

type WalletLinkCardProps = {
  wallet: Pick<Wallet, "id" | "name"> & {
    teachers: { teacher: Pick<Teacher, "name"> }[]
    parts: (Pick<Part, "id" | "name"> & {
      users: { user: Pick<User, "id"> }[]
    })[]
  }
}

export function WalletLinkCard({ wallet }: WalletLinkCardProps) {
  return (
    <Link to={`/student/wallet/${wallet.id}`} className="block" key={wallet.id}>
      <Card>
        <CardHeader>
          <CardTitle>{wallet.name}</CardTitle>
          <CardDescription>担当教師: {wallet.teachers.map((teacher) => teacher.teacher.name).join(", ")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {wallet.parts.map((part) => (
              <div key={part.id} className="rounded border p-3 flex items-center justify-between">
                <p className="font-medium">{part.name}</p>
                <p className="text-sm text-muted-foreground">{part.users.length}人</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
