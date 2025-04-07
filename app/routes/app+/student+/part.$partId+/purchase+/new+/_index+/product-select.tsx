import { Product } from "@prisma/client"
import { Check, Plus } from "lucide-react"
import React from "react"
import { Button } from "~/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "~/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover"
import { cn } from "~/lib/utils"
import { useProductSelectStore } from "./stores/product-select"

const TriggerButton = React.forwardRef<HTMLButtonElement, React.ComponentPropsWithoutRef<"button">>((props, ref) => (
  <Button ref={ref} variant="outline" className="w-full max-w-[200px] justify-between" {...props}>
    商品を選択
    <Plus className="opacity-50" />
  </Button>
))

TriggerButton.displayName = "TriggerButton"

export default function ProductSelect({ products }: { products: Pick<Product, "id" | "name" | "price">[] }) {
  const productSelectStore = useProductSelectStore()
  return (
    <Popover>
      <PopoverTrigger asChild>
        <TriggerButton />
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command className="w-full">
          <CommandInput placeholder="商品を選択" className="h-9" autoFocus={false} />
          <CommandList>
            <CommandEmpty>商品が見つかりません</CommandEmpty>
            <CommandGroup>
              {products.map((product) => (
                <CommandItem
                  key={product.id}
                  value={product.id}
                  onSelect={() => {
                    if (productSelectStore.find(product.id)) {
                      productSelectStore.remove(product.id)
                    } else {
                      productSelectStore.add(product, product.id)
                    }
                  }}
                >
                  <div>
                    <div className="text-base">{product.name}</div>
                    <div className="text-sm text-muted-foreground leading-none">¥{product.price}</div>
                  </div>
                  <Check className={cn("ml-auto", productSelectStore.find(product.id) ? "opacity-100" : "opacity-0")} />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
