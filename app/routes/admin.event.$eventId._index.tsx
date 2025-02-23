import { type LoaderFunctionArgs, json } from "@remix-run/node"
import { Form, Link, useFetcher, useLoaderData } from "@remix-run/react"
import { Pencil, Plus, Trash2 } from "lucide-react"
import { useState } from "react"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog"
import { Button } from "~/components/ui/button"
import { prisma } from "~/service.server/repository"

export async function loader({ params }: LoaderFunctionArgs) {
  const { eventId } = params
  const wallets = await prisma.wallet.findMany({ where: { eventId }, include: { parts: true } })
  return json({ wallets, eventId })
}

export default function AdminEventIndex() {
  const { wallets, eventId } = useLoaderData<typeof loader>()
  const [deleteTarget, setDeleteTarget] = useState<{ type: "wallet" | "part"; id: string } | null>(null)
  const fetcher = useFetcher()

  const handleDelete = () => {
    if (!deleteTarget) return

    const url =
      deleteTarget.type === "wallet"
        ? `/admin/event/${eventId}/wallet/${deleteTarget.id}/delete`
        : `/admin/event/${eventId}/wallet/${deleteTarget.id}/part/${deleteTarget.id}/delete`

    fetcher.submit({}, { method: "post", action: url })
  }

  const generateInvitationUrl = (partId: string, accountant: number) => {
    return `http://localhost:5173/invitation/${partId}?accountant=${accountant}`
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert("URLがクリップボードにコピーされました")
    })
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-8">ウォレットとパート管理</h1>
      <Link to={`/admin/event/${eventId}/wallet/new`}>
        <Button className="mb-4 flex items-center">
          <Plus className="mr-2" /> 新しいウォレットを追加
        </Button>
      </Link>
      <div className="space-y-4">
        {wallets.map((wallet) => (
          <div key={wallet.id} className="border rounded p-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">
                {wallet.name} - <span className="font-bold text-green-600">{wallet.budgetLimit}円</span>
              </h2>
              <div className="flex space-x-2">
                <Link to={`/admin/event/${eventId}/wallet/${wallet.id}/edit`}>
                  <Button size="sm" className="flex items-center">
                    <Pencil className="mr-1" /> 編集
                  </Button>
                </Link>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="destructive" className="flex items-center" onClick={() => setDeleteTarget({ type: "wallet", id: wallet.id })}>
                      <Trash2 className="mr-1" /> 削除
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>削除確認</AlertDialogTitle>
                      <AlertDialogDescription>本当に削除しますか？この操作は取り消せません。</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <Button variant="outline" onClick={() => setDeleteTarget(null)}>
                        キャンセル
                      </Button>
                      <Button variant="destructive" onClick={handleDelete}>
                        削除
                      </Button>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-semibold">パート一覧</h3>
              <ul className="list-disc space-y-2">
                {wallet.parts.map((part) => (
                  <li key={part.id} className="flex justify-between items-center bg-gray-100 p-2 rounded-md">
                    <span className="font-medium">
                      {part.name} - <span className="font-bold text-green-600">{part.budgetLimit}円</span>
                    </span>
                    <div className="flex space-x-2">
                      <Link to={`/admin/event/${eventId}/wallet/${wallet.id}/part/${part.id}/edit`}>
                        <Button size="sm" className="flex items-center">
                          <Pencil className="mr-1" /> 編集
                        </Button>
                      </Link>
                      <Button size="sm" className="flex items-center" onClick={() => copyToClipboard(generateInvitationUrl(part.id, 0))}>
                        URLをコピー
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="destructive" className="flex items-center" onClick={() => setDeleteTarget({ type: "part", id: part.id })}>
                            <Trash2 className="mr-1" /> 削除
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>削除確認</AlertDialogTitle>
                            <AlertDialogDescription>本当に削除しますか？この操作は取り消せません。</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
                              キャンセル
                            </Button>
                            <Button variant="destructive" onClick={handleDelete}>
                              削除
                            </Button>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </li>
                ))}
              </ul>
              <Link to={`/admin/event/${eventId}/wallet/${wallet.id}/part/new`}>
                <Button size="sm" className="mt-2 flex items-center">
                  <Plus className="mr-1" /> 新しいパートを追加
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
