import { Link, json, useLoaderData } from "@remix-run/react"
import { Button } from "~/components/ui/button"
import { prisma } from "~/service.server/db"

export const loader = async () => {
  const events = await prisma.event.findMany()
  return json({ events })
}

export default function AdminDashboard() {
  const { events } = useLoaderData<typeof loader>()

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-8">管理者ダッシュボード</h1>
      <div className="space-y-4">
        {events.map((event) => (
          <Link key={event.id} to={`/admin/event/${event.id}`}>
            <Button>{event.name}</Button>
          </Link>
        ))}
        <Link to="/admin/event/new">
          <Button>イベント作成</Button>
        </Link>
      </div>
    </div>
  )
}
