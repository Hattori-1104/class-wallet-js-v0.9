import { Part, Teacher, Wallet } from "@prisma/client"
import { Link } from "@remix-run/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"

type WalletLinkCardProps = {
  wallet: Wallet & { teachers: { teacher: Teacher }[]; parts: Part[] }
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
          <div className="flex flex-col gap-2">
            <p className="text-sm text-gray-600">パート数: {wallet.parts.length}個</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
