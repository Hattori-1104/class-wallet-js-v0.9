import { Outlet } from "@remix-run/react"
import { Header } from "~/components/common/header"

export default function AdminLayout() {
  return (
    <>
      <Header />
      <Outlet />
    </>
  )
}
