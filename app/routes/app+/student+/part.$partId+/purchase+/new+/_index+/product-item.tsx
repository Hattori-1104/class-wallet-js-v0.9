import { BookDashed, BookMarked, BookPlus, Minus, Plus, Trash2 } from "lucide-react"
import { Button } from "~/components/ui/button"
import { Separator } from "~/components/ui/separator"

type ProductInfo = { name: string; price: number }
type PurchaseItemType = { info: ProductInfo; quantity: number; id: string }
type ProductStore = { increaseQuantity: (id: string) => void; decreaseQuantity: (id: string) => void; remove: (id: string) => void }
type ProductType = "selected" | "shared" | "private"
type ProductItemProps = {
  store: ProductStore
  purchaseItem: PurchaseItemType
  type: ProductType
}

const ProductIcon = ({ type, className, size = 24 }: { type: ProductType; className?: string; size?: number }) => {
  return {
    selected: <BookMarked size={size} className={className} />,
    shared: <BookPlus size={size} className={className} />,
    private: <BookDashed size={size} className={className} />,
  }[type]
}

export default function ProductItem({ store, purchaseItem, type }: ProductItemProps) {
  return (
    <div className="flex items-center justify-between border rounded-md py-4">
      <div className="flex items-center flex-1 shrink min-w-0">
        {/* <ProductIcon type={type} size={20} className="mx-2 flex-shrink-0" /> */}
        <div className="flex-1 min-w-0 ml-3">
          <div className="leading-snug truncate">{purchaseItem.info.name}</div>
          <div className="text-sm text-gray-500 leading-none">¥{purchaseItem.info.price}</div>
        </div>
      </div>
      <div className="flex flex-row gap-2 items-center mr-3">
        <div className="text-sm mr-2">×{purchaseItem.quantity}</div>
        <div className="flex flex-row border rounded-md justify-between items-center">
          <button type="button" className="size-8 rounded-full" onClick={() => store.decreaseQuantity(purchaseItem.id)}>
            <Minus className="size-4 mx-auto" />
          </button>
          <Separator orientation="vertical" className="h-4" />
          <button type="button" className="size-8 rounded-full" onClick={() => store.increaseQuantity(purchaseItem.id)}>
            <Plus className="size-4 mx-auto" />
          </button>
        </div>
        <Button variant="destructive" size={"icon"} onClick={() => store.remove(purchaseItem.id)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
