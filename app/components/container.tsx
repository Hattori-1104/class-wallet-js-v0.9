import { ReactNode } from "react"
import { cn } from "~/lib/utils"
export function Container({ children, title }: { children: ReactNode; title?: string }) {
  return (
    <div className="container mx-auto px-4">
      {title && <ContainerTitle>{title}</ContainerTitle>}
      <div className="space-y-6">{children}</div>
    </div>
  )
}

export function ContainerTitle({ className, children }: { className?: string; children: ReactNode }) {
  return <h1 className={cn("my-6 text-2xl font-bold", className)}>{children}</h1>
}

export function ContainerGrid({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("grid grid-cols-1 gap-6 sm:grid-cols-2", className)}>{children}</div>
}

export function ContainerSectionHeader({ className, children }: { className?: string; children: ReactNode }) {
  return <h2 className={cn("text-xl font-semibold mb-2", className)}>{children}</h2>
}

export function ContainerSection({ className, title, children }: { className?: string; title?: string; children: ReactNode }) {
  return (
    <section className={cn(className)}>
      {title && <ContainerSectionHeader>{title}</ContainerSectionHeader>}
      {children}
    </section>
  )
}
