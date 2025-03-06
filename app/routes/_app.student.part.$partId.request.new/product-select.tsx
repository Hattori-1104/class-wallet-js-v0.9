import { Product } from "@prisma/client"
import { Check, Plus } from "lucide-react"
import React from "react"
import { Button } from "~/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "~/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover"
import { cn } from "~/lib/utils"
import { useSelectedProductsStore } from "./stores/selected-products"

const TriggerButton = React.forwardRef<HTMLButtonElement, React.ComponentPropsWithoutRef<"button">>((props, ref) => (
  <Button ref={ref} variant="outline" className="w-full max-w-[200px] justify-between" {...props}>
    商品を追加
    <Plus className="opacity-50" />
  </Button>
))

TriggerButton.displayName = "TriggerButton"

export default function ProductSelect({ products }: { products: Pick<Product, "id" | "name" | "price">[] }) {
  const { selectedProducts, addProduct, removeProduct } = useSelectedProductsStore()
  return (
    <Popover>
      <PopoverTrigger asChild>
        <TriggerButton />
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command className="w-full">
          <CommandInput placeholder="商品を選択" className="h-9" />
          <CommandList>
            <CommandEmpty>商品が見つかりません</CommandEmpty>
            <CommandGroup>
              {products.map((product) => (
                <CommandItem
                  key={product.id}
                  value={product.name}
                  onSelect={() => {
                    if (selectedProducts.get(product.id)) {
                      removeProduct(product.id)
                    } else {
                      addProduct(product)
                    }
                  }}
                >
                  {product.name}
                  <Check className={cn("ml-auto", selectedProducts.get(product.id) ? "opacity-100" : "opacity-0")} />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
