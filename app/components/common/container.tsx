import { ReactNode } from "react"
import { cn } from "~/lib/utils"
export function Container({ children, title, className }: { children: ReactNode; title?: string; className?: string }) {
  return (
    <div className={cn("container mx-auto px-8", className)}>
      {title && <ContainerTitle>{title}</ContainerTitle>}
      <div className="space-y-6 my-6">{children}</div>
    </div>
  )
}

export function ContainerTitle({ className, children }: { className?: string; children: ReactNode }) {
  return <h1 className={cn("my-6 text-2xl font-bold", className)}>{children}</h1>
}

export function ContainerGrid({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("grid grid-cols-1 gap-6 sm:grid-cols-2", className)}>{children}</div>
}

export function ContainerSectionHeader({ className, title, description }: { className?: string; title?: string; description?: string }) {
  return (
    <div className={cn("mb-2 flex flex-row items-center gap-2 justify-between", className)}>
      {title && <h2 className="text-xl font-semibold">{title}</h2>}
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
    </div>
  )
}

export function ContainerSection({
  className,
  title,
  description,
  children,
}: { className?: string; title?: string; description?: string; children: ReactNode }) {
  return (
    <section className={cn(className)}>
      {title && <ContainerSectionHeader title={title} description={description} />}
      {children}
    </section>
  )
}

export function ContainerCard({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("desk:border desk:rounded-lg desk:shadow max-w-[480px] w-full mx-auto", className)}>{children}</div>
}
