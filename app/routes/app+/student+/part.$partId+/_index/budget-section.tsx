import { BudgetGauge } from "~/components/common/budget/indicator"
import { ContainerSection } from "~/components/common/container"
import { displayPercent } from "~/utils/calc"
import { formatMoney } from "~/utils/display"

export function BudgetSection({
  budget,
  usage,
  plannedUsage,
  plannedPurchasesCount,
}: { budget: number; usage: number; plannedUsage: number; plannedPurchasesCount: number }) {
  return (
    <ContainerSection title="残り予算">
      <div className="space-y-2">
        <div className="flex flex-row justify-between items-baseline">
          <div className="text-sm text-muted-foreground">{displayPercent(budget - usage, budget)}</div>
          <div className="flex flex-row items-baseline gap-1">
            <span className="text-lg text-semibold">{formatMoney(budget - usage)}</span>
            <span className="text-sm text-muted-foreground">/</span>
            <span className="text-sm text-muted-foreground">{formatMoney(budget)}</span>
          </div>
        </div>
        <BudgetGauge budget={budget} usage={usage} plannedUsage={plannedUsage} />
        <div className="flex flex-row justify-between items-baseline">
          <div className="text-sm text-muted-foreground">使用予定</div>
          <div className="flex flex-row items-baseline gap-1">
            <span className="text-semibold">{formatMoney(plannedUsage)}</span>
            <span className="text-sm text-muted-foreground">:</span>
            <span className="text-sm text-muted-foreground">{plannedPurchasesCount}件</span>
          </div>
        </div>
      </div>
    </ContainerSection>
  )
}
