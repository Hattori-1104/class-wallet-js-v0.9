import { Link, json, useLoaderData } from "@remix-run/react"
import { Container } from "~/components/common/container"
import { Button } from "~/components/ui/button"
import { prisma } from "~/service.server/repository"

export const loader = async () => {
  const events = await prisma.event.findMany()
  return json({ events })
}

export default function AdminDashboard() {
  const { events } = useLoaderData<typeof loader>()

  return (
    <Container>
      <h1 className="text-2xl font-bold my-4">管理者ダッシュボード</h1>
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
    </Container>
  )
}
