import { LoaderFunctionArgs } from "@remix-run/node"
import { Outlet, useLoaderData } from "@remix-run/react"
import { House, ShoppingCart } from "lucide-react"
import { Navigation } from "~/components/common/navigation"
import { requirePart } from "~/services/loader.utils.server"

export const loader = ({ params }: LoaderFunctionArgs) => {
  const partId = requirePart(params)
  return { partId }
}

export default function PartLayout() {
  const { partId } = useLoaderData<typeof loader>()
  return (
    <>
      <div className="overflow-y-auto flex-grow">
        <Outlet />
      </div>
      {/* <div className="h-16 flex-shrink-0" /> */}
      <Navigation
        links={[
          { label: "ホーム", icon: <House className="w-6 h-6" />, to: `/app/student/part/${partId}` },
          { label: "買い出し", icon: <ShoppingCart className="w-6 h-6" />, to: `/app/student/part/${partId}/purchase` },
        ]}
      />
    </>
  )
}
