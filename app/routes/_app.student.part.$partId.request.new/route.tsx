import { ActionFunctionArgs, LoaderFunctionArgs, json, redirect } from "@remix-run/node"
import { Form, Link, useFetcher, useLoaderData, useOutletContext } from "@remix-run/react"
import { useEffect } from "react"
import { Container } from "~/components/container"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { Separator } from "~/components/ui/separator"
import { formatMoney } from "~/lib/utils"
import { AppContextType } from "~/routes/_app"
import { prisma } from "~/service.server/repository"
import { commitToastByCase, destroySessionInfo, getSessionInfo } from "~/service.server/session"
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
    where: {
      shared: true,
    },
  })

  return json({ purchases, partId, products })
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData()
  const partId = formData.get("partId")
  const products = formData.get("products")
  console.log(partId, products)
  return null
}

export default function RequestNew() {
  const { purchases, partId, products } = useLoaderData<typeof loader>()
  const { setBackRoute } = useOutletContext<AppContextType>()
  const addedProductsStore = useAddedProductsStore()
  const selectedProductsStore = useSelectedProductsStore()

  const getTotalPrice = () => {
    return (
      addedProductsStore.getAllProducts().reduce((acc, product) => acc + product.price * product.amount, 0) +
      selectedProductsStore.getAllProducts().reduce((acc, product) => acc + product.price * product.amount, 0)
    )
  }

  useEffect(() => {
    setBackRoute(`/student/part/${partId}`)
  }, [setBackRoute, partId])

  const fetcher = useFetcher()
  const handleSubmit = () => {
    // fetcher.submit({
    //   partId,
    // }, { method: "post" })
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
            <div className="flex flex-row gap-2 w-full">
              <ProductSelect products={products} />
              <ProductAdd />
            </div>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 md:grid-cols-2">
              {selectedProductsStore.getAllProducts().map((product) => (
                <ProductItem key={product.id} store={selectedProductsStore} product={product} type="selected" />
              ))}
              {addedProductsStore.addedProducts.map((product) => (
                <ProductItem key={product.id} store={addedProductsStore} product={product} type={product.share ? "shared" : "private"} />
              ))}
            </div>
            <Separator />
            <div className="flex justify-between">
              <div>合計金額：</div>
              <div className="text-lg font-bold">{formatMoney(getTotalPrice())}</div>
            </div>
            <div className="flex justify-end gap-2">
              <Link to={`/student/part/${partId}`} className="flex-1">
                <Button variant="outline" className="w-full">
                  キャンセル
                </Button>
              </Link>
              <Button className="flex-1" type="submit" onClick={handleSubmit} disabled={getTotalPrice() === 0}>
                購入リクエストを送信
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </Container>
  )
}
