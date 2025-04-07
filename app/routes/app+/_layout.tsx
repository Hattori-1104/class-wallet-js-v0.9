import { Outlet } from "@remix-run/react"
import { Header } from "~/components/common/header"

export default function AppLayout() {
  return (
    <>
      <Header />
      <Outlet />
    </>
  )
}
