import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node"
import { redirect } from "@remix-run/node"
import { Link, useFetcher, useLoaderData } from "@remix-run/react"
import { useMemo, useState } from "react"
import { z } from "zod"
import { Container, ContainerSection, ContainerTitle } from "~/components/common/container"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Separator } from "~/components/ui/separator"
import { requirePart, requireStudent } from "~/services/loader.utils.server"
import { escapeError } from "~/services/navigation.server"
import { repository } from "~/services/repository.server"
import { formatMoney } from "~/utils/display"
import ProductAdd from "./product-add"
import ProductItem from "./product-item"
import ProductSelect from "./product-select"
import { useProductAddStore } from "./stores/product-add"
import { useProductSelectStore } from "./stores/product-select"

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const partId = requirePart(params)
  const products = await repository(async (prisma) => {
    return await prisma.product.findMany({
      where: {
        doesShare: true,
      },
      select: {
        id: true,
        name: true,
        price: true,
      },
    })
  }, `/app/student/part/${partId}`)
  return { products, partId }
}

const purchaseBodySchema = z.object({
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
      quantity: z.number(),
      doesShare: z.boolean(),
    }),
  ),
  selectedProducts: z.array(
    z.object({
      id: z.string(),
      quantity: z.number(),
    }),
  ),
})

type purchaseBodyType = z.infer<typeof purchaseBodySchema>

export default function NewRequest() {
  const [note, setNote] = useState("")
  const { products, partId } = useLoaderData<typeof loader>()
  const productSelectStore = useProductSelectStore()
  const productAddStore = useProductAddStore()

  const getTotalPrice = useMemo(() => {
    return (
      productAddStore.getAllAsObject().reduce((acc, item) => acc + item.info.price * item.quantity, 0) +
      productSelectStore.getAllAsObject().reduce((acc, item) => acc + item.info.price * item.quantity, 0)
    )
  }, [productAddStore, productSelectStore])

  const getTempNote = useMemo(() => {
    return [...productSelectStore.getAllAsObject(), ...productAddStore.getAllAsObject()]
      .map((product) => `${product.info.name} ${product.quantity}個`)
      .join("、")
  }, [productAddStore, productSelectStore])

  const fetcher = useFetcher()
  const handleSubmit = () => {
    const body: purchaseBodyType = {
      partId,
      note: note || getTempNote,
      addedProducts: productAddStore.getAllAsObject(),
      selectedProducts: productSelectStore.getAllAsObject().map((product) => ({ id: product.id, quantity: product.quantity })),
    }
    fetcher.submit(body, {
      method: "post",
      encType: "application/json",
    })
  }

  return (
    <Container>
      <ContainerTitle>新規リクエスト</ContainerTitle>
      <ContainerSection>
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
            {productSelectStore.getAllAsObject().map((product) => (
              <ProductItem key={product.id} store={productSelectStore} purchaseItem={product} type="selected" />
            ))}
            {productAddStore.getAllAsObject().map((product) => (
              <ProductItem key={product.id} store={productAddStore} purchaseItem={product} type={product.doesShare ? "shared" : "private"} />
            ))}
          </div>
          <Separator />
          <div className="flex justify-between">
            <div>合計金額：</div>
            <div className="text-lg font-bold">{formatMoney(getTotalPrice)}</div>
          </div>
          <div className="flex flex-col desk:flex-row gap-2">
            <Link to={`/app/student/part/${partId}`} className="flex-1">
              <Button variant="outline" className="w-full">
                キャンセル
              </Button>
            </Link>
            <Button className="flex-1" type="submit" onClick={handleSubmit} disabled={getTotalPrice === 0 || fetcher.state !== "idle"}>
              {fetcher.state === "submitting" ? "送信中..." : "購入リクエスト"}
            </Button>
          </div>
        </div>
      </ContainerSection>
    </Container>
  )
}

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const partId = requirePart(params)
  const studentId = await requireStudent(request)
  const body = await request.json()
  const { success, data } = purchaseBodySchema.safeParse(body)
  if (!success) {
    throw escapeError(`/app/student/part/${partId}/purchase/new`)
  }
  const { addedProducts, selectedProducts, note } = data
  await repository(async (prisma) => {
    await prisma.purchase.create({
      data: {
        note,
        part: {
          connect: {
            id: partId,
          },
        },
        requestCert: {
          create: {
            signedBy: {
              connect: {
                id: studentId,
              },
            },
            approved: true,
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
              quantity: product.quantity,
            })),
            ...selectedProducts.map((product) => ({
              product: {
                connect: { id: product.id },
              },
              quantity: product.quantity,
            })),
          ],
        },
      },
    })
  }, `/app/student/part/${partId}`)
  return redirect(`/app/student/part/${partId}`)
}
