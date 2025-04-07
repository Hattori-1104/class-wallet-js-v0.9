import { LoaderFunctionArgs } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import { requirePurchase } from "~/services/loader.utils.server"

export const loader = ({ params }: LoaderFunctionArgs) => {
  const purchaseId = requirePurchase(params)
  return { purchaseId }
}

export default function Purchase() {
  const { purchaseId } = useLoaderData<typeof loader>()
  return <div>{purchaseId}</div>
}
