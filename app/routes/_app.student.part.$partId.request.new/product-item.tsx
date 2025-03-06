import { BookDashed, BookMarked, BookPlus, Minus, Plus, Trash2 } from "lucide-react"
import { Button } from "~/components/ui/button"

type ProductInfo = { id: string; name: string; price: number; amount: number }
type ProductStore = { increaseAmount: (id: string) => void; decreaseAmount: (id: string) => void; removeProduct: (id: string) => void }
type ProductType = "selected" | "shared" | "private"
type ProductItemProps = {
  store: ProductStore
  product: ProductInfo
  type: ProductType
}

const ProductIcon = ({ type, className, size = 24 }: { type: ProductType; className?: string; size?: number }) => {
  return {
    selected: <BookMarked size={size} className={className} />,
    shared: <BookPlus size={size} className={className} />,
    private: <BookDashed size={size} className={className} />,
  }[type]
}

export default function ProductItem({ store, product, type }: ProductItemProps) {
  return (
    <div className="flex items-center justify-between border rounded-md p-4">
      <div className="flex items-center gap-4 flex-1">
        <ProductIcon type={type} size={20} />
        <div className="flex-1">
          <div className="leading-snug truncate">{product.name}</div>
          <div className="text-sm text-gray-500 leading-none">¥{product.price}</div>
        </div>
      </div>
      <div className="flex flex-row gap-2 items-center">
        <div className="text-sm mr-2">×{product.amount}</div>
        <Button variant="outline" size={"icon"} onClick={() => store.decreaseAmount(product.id)}>
          <Minus className="h-4 w-4" />
        </Button>
        <Button variant="outline" size={"icon"} onClick={() => store.increaseAmount(product.id)}>
          <Plus className="h-4 w-4" />
        </Button>
        <Button variant="destructive" size={"icon"} onClick={() => store.removeProduct(product.id)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
