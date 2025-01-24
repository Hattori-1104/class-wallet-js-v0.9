import { LoaderFunctionArgs } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import { ScrollArea } from "~/components/ui/scroll-area"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table"
import { db } from "~/service.server/repository"
import { getSession } from "~/service.server/session"

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  // ユーザーIDの取得
  const session = await getSession(request.headers.get("Cookie"))
  const userId = session.get("userId")
  if (userId === undefined) throw new Error("セッションにユーザーが存在しない")

  // パートIDの取得
  const partId = Number(params.partId)
  if (Number.isNaN(partId)) throw new Error("パートIDの形式が不適切")

  // パートの取得 ＆ ユーザーの取得
  const currentSession = await db.userPosition.findFirst({
    where: { userId, partId },
    select: {
      part: { select: { id: true, name: true, shoppings: { include: { shoppingItems: { include: { product: true } } } } } },
      user: { select: { id: true, name: true } },
    },
  })
  // 冗長
  if (currentSession === null) throw new Error("データベースにパートとユーザーの組み合わせが存在しない")
  return { currentSession }
}

export default function PartHistoryPage() {
  const { currentSession } = useLoaderData<typeof loader>()
  const dateFormatter = (date: Date) => `${date.getMonth() + 1}/${date.getDate()}`
  return (
    <div className="flex flex-col gap-2 p-2">
      <ScrollArea className="w-full rounded-md border p-2">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>日付</TableHead>
              <TableHead>商品</TableHead>
              <TableHead className="text-right">数量</TableHead>
              <TableHead className="text-right">金額</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentSession.part.shoppings.map((shopping) =>
              shopping.shoppingItems.map((shoppingItem) => (
                <TableRow key={shoppingItem.id}>
                  <TableCell>{dateFormatter(shopping.createdAt)}</TableCell>
                  <TableCell>{shoppingItem.product.name}</TableCell>
                  <TableCell className="text-right">{shoppingItem.amount}</TableCell>
                  <TableCell className="text-right">{shoppingItem.product.price * shoppingItem.amount}</TableCell>
                </TableRow>
              )),
            )}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  )
}
