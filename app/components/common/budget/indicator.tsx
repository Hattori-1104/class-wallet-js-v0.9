import { cn } from "~/lib/utils"

export const BudgetGauge = ({ budget, usage, plannedUsage }: { budget: number; usage: number; plannedUsage: number }) => {
  return (
    <div className="bg-primary/20 rounded-full h-2 relative overflow-hidden">
      <div className="bg-primary/50 h-2 absolute w-full" style={{ transform: `translateX(-${(usage / budget) * 100}%)` }} />
      <div className="bg-primary h-2 absolute w-full" style={{ transform: `translateX(-${((usage + plannedUsage) / budget) * 100}%)` }} />
    </div>
  )
}
