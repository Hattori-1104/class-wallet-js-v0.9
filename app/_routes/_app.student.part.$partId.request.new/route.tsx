import { ActionFunctionArgs, LoaderFunctionArgs, json, redirect } from "@remix-run/node"
import { Link, useFetcher, useLoaderData, useOutletContext } from "@remix-run/react"
import { useEffect, useMemo, useState } from "react"
import { z } from "zod"
import { Container } from "~/components/common/container"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Separator } from "~/components/ui/separator"
import { formatMoney } from "~/lib/utils"
import { AppContextType } from "~/routes/_app"
import { prisma } from "~/service.server/repository"
import { commitToastByCase, destroySessionInfo, getSession, getSessionInfo } from "~/service.server/session"
import ProductAdd from "./product-add"
import ProductItem from "./product-item"
import ProductSelect from "./product-select"
import { useAddedProductsStore } from "./stores/added-products"
import { useSelectedProductsStore } from "./stores/selected-products"

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { success, session, sessionData } = await getSessionInfo(request)
  if (!success) return redirect("/auth", { headers: { "Set-Cookie": await destroySessionInfo(request) } })

  const partId = params.partId
  if (!partId) return redirect("/student", { headers: { "Set-Cookie": await commitToastByCase(session, "InvalidURL") } })

  const userPart = await prisma.userPart.findFirst({
    where: {
      userId: sessionData.userId,
      partId: partId,
    },
  })

  if (!userPart) return redirect("/student", { headers: { "Set-Cookie": await commitToastByCase(session, "NotFound") } })

  const purchases = await prisma.purchase.findMany({
    where: { partId },
    select: {
      approvedByAccountant: true,
      approvedByTeacher: true,
      requestedBy: true,
    },
    orderBy: { createdAt: "desc" },
  })
  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      price: true,
    },
    where: {
      doesShare: true,
    },
  })

  return json({ purchases, partId, products })
}

const requestBodySchema = z.object({
  partId: z.string(),
  note: z.string(),
  addedProducts: z.array(
    z.object({
      id: z.string(),
      info: z.object({
        name: z.string(),
        price: z.number(),
        description: z.string().optional(),
      }),
      amount: z.number(),
      doesShare: z.boolean(),
    }),
  ),
  selectedProducts: z.array(
    z.object({
      id: z.string(),
      amount: z.number(),
    }),
  ),
})

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const session = await getSession(request.headers.get("Cookie"))
  const userId = session.get("userId")

  if (!userId) throw new Error("ユーザーが見つかりません")

  const partId = params.partId
  if (!partId) throw new Error("パートが見つかりません")

  const body = await request.json()
  const { success: parseSuccess, data } = requestBodySchema.safeParse(body)
  if (!parseSuccess) throw new Error("いったんこれで")
  const { addedProducts, selectedProducts, note } = data
  await prisma.purchase.create({
    data: {
      note,
      part: {
        connect: {
          id: partId,
        },
      },
      requestedBy: {
        connect: {
          id: userId,
        },
      },
      items: {
        create: [
          ...addedProducts.map((product) => ({
            product: {
              create: {
                name: product.info.name,
                price: product.info.price,
                doesShare: product.doesShare,
              },
            },
            amount: product.amount,
          })),
          ...selectedProducts.map((product) => ({
            product: {
              connect: { id: product.id },
            },
            amount: product.amount,
          })),
        ],
      },
    },
  })
  return redirect(`/student/part/${partId}`)
}

type requestBodyType = z.infer<typeof requestBodySchema>

export default function RequestNew() {
  const { purchases, partId, products } = useLoaderData<typeof loader>()
  const { setBackRoute } = useOutletContext<AppContextType>()
  const addedProductsStore = useAddedProductsStore()
  const selectedProductsStore = useSelectedProductsStore()
  const [note, setNote] = useState("")

  const getTotalPrice = useMemo(() => {
    return (
      addedProductsStore.getAllAsObject().reduce((acc, item) => acc + item.info.price * item.amount, 0) +
      selectedProductsStore.getAllAsObject().reduce((acc, item) => acc + item.info.price * item.amount, 0)
    )
  }, [addedProductsStore, selectedProductsStore])

  const getTempNote = useMemo(() => {
    return [...selectedProductsStore.getAllAsObject(), ...addedProductsStore.getAllAsObject()]
      .map((product) => `${product.info.name} ${product.amount}個`)
      .join("、")
  }, [addedProductsStore, selectedProductsStore])

  useEffect(() => {
    setBackRoute(`/student/part/${partId}`)
  }, [setBackRoute, partId])

  const fetcher = useFetcher()
  const handleSubmit = () => {
    const body: requestBodyType = {
      partId,
      note: note || getTempNote,
      addedProducts: addedProductsStore.getAllAsObject(),
      selectedProducts: selectedProductsStore.getAllAsObject().map((product) => ({ id: product.id, amount: product.amount })),
    }
    addedProductsStore.clear()
    selectedProductsStore.clear()
    fetcher.submit(body, {
      method: "post",
      encType: "application/json",
    })
  }

  return (
    <Container title="購入リクエスト">
      <Card>
        <CardHeader>
          <CardTitle>新規購入リクエスト</CardTitle>
          <CardDescription>購入したい商品の情報を入力してください</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>購入リクエストの説明</Label>
              <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder={getTempNote || "省略可能"} />
            </div>
            <div className="flex flex-row gap-2 w-full">
              <ProductSelect products={products} />
              <ProductAdd />
            </div>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 md:grid-cols-2">
              {selectedProductsStore.getAllAsObject().map((product) => (
                <ProductItem key={product.id} store={selectedProductsStore} purchaseItem={product} type="selected" />
              ))}
              {addedProductsStore.getAllAsObject().map((product) => (
                <ProductItem key={product.id} store={addedProductsStore} purchaseItem={product} type={product.doesShare ? "shared" : "private"} />
              ))}
            </div>
            <Separator />
            <div className="flex justify-between">
              <div>合計金額：</div>
              <div className="text-lg font-bold">{formatMoney(getTotalPrice)}</div>
            </div>
            <div className="flex justify-end gap-2">
              <Link to={`/student/part/${partId}`} className="flex-1">
                <Button variant="outline" className="w-full">
                  キャンセル
                </Button>
              </Link>
              <Button className="flex-1" type="submit" onClick={handleSubmit} disabled={getTotalPrice === 0}>
                購入リクエストを送信
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </Container>
  )
}
