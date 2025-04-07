import { useLoaderData } from "@remix-run/react"
import { prisma } from "~/service.server/repository"
export const loader = async () => {
  const purchase = await prisma.purchase.findMany({
    select: {
      items: {
        select: {
          product: {
            select: {
              name: true,
            },
          },
          amount: true,
        },
      },
      note: true,
    },
  })
  return { purchase }
}

export default function Test() {
  const { purchase } = useLoaderData<typeof loader>()
  return <div>{purchase.map((p) => p.items.map((i) => i.product.name))}</div>
}
