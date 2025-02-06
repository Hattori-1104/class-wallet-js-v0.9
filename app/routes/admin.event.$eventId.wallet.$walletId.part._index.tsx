import { type LoaderFunctionArgs, json } from "@remix-run/node"
import { type ActionFunctionArgs } from "@remix-run/node"
import { Form, Link, useLoaderData } from "@remix-run/react"
import { Pencil, Plus, Trash2 } from "lucide-react"
import { Button } from "~/components/ui/button"
import { prisma } from "~/service.server/db"

export async function loader({ params }: LoaderFunctionArgs) {
  const { walletId } = params
  const parts = await prisma.part.findMany({ where: { walletId } })
  return json({ parts })
}

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const { partId } = params
  if (!partId) throw new Error("Part ID is required")

  await prisma.part.delete({
    where: { id: partId },
  })

  return new Response("Part deleted", { status: 200 })
}

export default function AdminEventWalletPartIndex() {
  const { parts } = useLoaderData<typeof loader>()

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-8">パート管理</h1>
      <Link to="/admin/event/$eventId/wallet/$walletId/part/new">
        <Button className="mb-4 flex items-center">
          <Plus className="mr-2" /> 新しいパートを追加
        </Button>
      </Link>
      <div className="space-y-4">
        {parts.map((part) => (
          <div key={part.id} className="border rounded p-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">{part.name}</h2>
              <div className="flex space-x-2">
                <Link to={`/admin/event/$eventId/wallet/$walletId/part/${part.id}/edit`}>
                  <Button size="sm" className="flex items-center">
                    <Pencil className="mr-1" /> 編集
                  </Button>
                </Link>
                <Form method="post" action={`/admin/event/$eventId/wallet/$walletId/part/${part.id}/delete`}>
                  <Button size="sm" variant="destructive" className="flex items-center">
                    <Trash2 className="mr-1" /> 削除
                  </Button>
                </Form>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
