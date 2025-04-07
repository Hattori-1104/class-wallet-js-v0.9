import { Part, Wallet } from "@prisma/client"
import { Link } from "@remix-run/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { getWalletMemberCount } from "~/lib/calc"

type WalletLinkCardProps = {
  wallet: Pick<Wallet, "id" | "name"> & {
    parts: (Pick<Part, "id" | "name"> & {
      _count: {
        users: number
      }
    })[]
  }
}

export function WalletLinkCard({ wallet }: WalletLinkCardProps) {
  return (
    <div className="space-y-2">
      <Link to={`/teacher/wallet/${wallet.id}`} className="block" key={wallet.id}>
        <Card>
          <CardHeader>
            <CardTitle>{wallet.name}</CardTitle>
            <CardDescription>{getWalletMemberCount({ wallet })}人</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {wallet.parts.map((part) => (
                <div key={part.id} className="border rounded p-3 flex flex-row items-center justify-between">
                  <p>{part.name}</p>
                  <p className="text-sm text-muted-foreground">{part._count.users}人</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </Link>
    </div>
  )
}
