import { getFormProps, getInputProps, useForm } from "@conform-to/react"
import { parseWithZod } from "@conform-to/zod"
import { Plus } from "lucide-react"
import { useState } from "react"
import React from "react"
import { z } from "zod"
import { Button } from "~/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog"
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "~/components/ui/drawer"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Switch } from "~/components/ui/switch"
import { useIsMobile } from "~/hooks/useIsMobile"
import { useAddedProductsStore } from "./stores/added-products"

const productAddSchema = z.object({
  name: z.string().max(50),
  price: z.coerce.number().min(1).max(1000000),
  description: z.string().optional(),
})

const formId = "product-add-form"

function ProductAddForm({ setFormOpen }: { setFormOpen: (open: boolean) => void }) {
  const { addProduct } = useAddedProductsStore()
  const [share, setShare] = useState(true)
  const [form, fields] = useForm({
    id: formId,
    lastResult: null,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: productAddSchema })
    },
    onSubmit(event, { formData }) {
      event.preventDefault()
      const { success, data } = productAddSchema.safeParse(Object.fromEntries(formData.entries()))
      if (success) {
        addProduct({
          id: crypto.randomUUID(),
          name: data.name,
          price: data.price,
          amount: 1,
          description: data.description,
          share,
        })
        setFormOpen(false)
      }
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  })
  return (
    <form {...getFormProps(form)} className="space-y-4 py-4">
      <div className="grid grid-cols-[80px_1fr] gap-4 items-center">
        <Label htmlFor={fields.name.id} className="text-right">
          商品名
        </Label>
        <Input {...getInputProps(fields.name, { type: "text" })} />
        <Label htmlFor={fields.price.id} className="text-right">
          価格
        </Label>
        <Input {...getInputProps(fields.price, { type: "number" })} />
        <Label htmlFor={fields.description.id} className="text-right">
          備考
        </Label>
        <Input {...getInputProps(fields.description, { type: "text" })} />
      </div>
      <div className="flex items-center justify-end gap-2">
        <Label htmlFor="share" className="text-right">
          この商品を登録する
        </Label>
        <Switch id="share" checked={share} onCheckedChange={setShare} />
        {/* <Button type="submit">追加</Button> */}
      </div>
    </form>
  )
}

const TriggerButton = React.forwardRef<HTMLButtonElement, React.ComponentPropsWithoutRef<"button">>(({ ...props }, ref) => (
  <Button ref={ref} variant="outline" className="w-full max-w-[200px] justify-between" {...props}>
    商品を追加
    <Plus className="opacity-50" />
  </Button>
))

TriggerButton.displayName = "TriggerButton"

export default function ProductAdd() {
  const isMobile = useIsMobile()
  const [formOpen, setFormOpen] = useState(false)

  return isMobile ? (
    <Drawer open={formOpen} onOpenChange={setFormOpen}>
      <DrawerTrigger asChild>
        <TriggerButton />
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>商品を追加</DrawerTitle>
          <DrawerDescription>未登録の商品情報を入力してください。</DrawerDescription>
        </DrawerHeader>
        <div className="px-4">
          <ProductAddForm setFormOpen={setFormOpen} />
        </div>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">キャンセル</Button>
          </DrawerClose>
          <Button type="submit" form={formId}>
            追加
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ) : (
    <Dialog open={formOpen} onOpenChange={setFormOpen}>
      <DialogTrigger asChild>
        <TriggerButton />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>商品を追加</DialogTitle>
          <DialogDescription>未登録の商品情報を入力してください。</DialogDescription>
        </DialogHeader>
        <ProductAddForm setFormOpen={setFormOpen} />
        <DialogFooter className="flex gap-2">
          <DialogClose asChild className="flex-1">
            <Button variant="outline">キャンセル</Button>
          </DialogClose>
          <Button type="submit" form={formId} className="flex-1">
            追加
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
