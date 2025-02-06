import type { Part } from "@prisma/client"
import { Link } from "@remix-run/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"

interface PartCardProps {
  part: Part & {
    users: {
      user: { id: string; name: string }
      role: { name: string }
    }[]
  }
}

export function PartCard({ part }: PartCardProps) {
  return (
    <Link to={`/student/part/${part.id}`} className="block" key={part.id}>
      <Card>
        <CardHeader>
          <CardTitle>{part.name}</CardTitle>
          <CardDescription>メンバー数: {part.users.length}名</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="mb-2 font-semibold">メンバー</h3>
              <div className="grid gap-2 md:grid-cols-2">
                {part.users.map(({ user, role }) => (
                  <div key={user.id} className="rounded border p-2">
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-gray-600">{role.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
