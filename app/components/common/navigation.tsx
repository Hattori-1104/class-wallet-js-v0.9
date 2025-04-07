import { NavLink, useLocation } from "@remix-run/react"
import * as React from "react"
import { cn } from "~/lib/utils"

type NavigationProps = {
  links: {
    label: string
    icon: React.ReactNode
    to: string
  }[]
}
export function Navigation({ links }: NavigationProps) {
  return (
    // <footer className="h-16 w-full border-t bg-white fixed bottom-0 left-0 right-0 shrink-0">
    <footer className="h-16 w-full border-t bg-white flex-shrink-0">
      <nav className="container mx-auto flex items-center justify-between h-full px-8">
        {links.map((link) => (
          <NavLink key={link.to} to={link.to} className="flex flex-col justify-center items-center gap-1 h-full w-20 m-1">
            {link.icon}
            <span className="text-xs">{link.label}</span>
          </NavLink>
        ))}
      </nav>
    </footer>
  )
}
