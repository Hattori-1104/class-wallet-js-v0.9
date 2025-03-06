import { create } from "zustand"
import { generateId } from "~/lib/utils"

type ProductInfoType = {
  name: string
  price: number
  description?: string
}

type PurchaseItemType = {
  info: ProductInfoType
  amount: number
}

type Store = {
  items: Map<string, PurchaseItemType>
  doesShare: Set<string>
}

type Action = {
  add: (info: ProductInfoType, doesShare: boolean) => void
  get: (id: string) => (PurchaseItemType & { doesShare: boolean }) | undefined
  find: (id: string) => boolean
  remove: (id: string) => boolean
  setAmount: (id: string, amount: number) => void
  increaseAmount: (id: string) => void
  decreaseAmount: (id: string) => void
  clear: () => void
}

export const useAddedProductsStore = create<Store & Action>((set, get) => ({
  items: new Map(),
  doesShare: new Set(),
  add: (info, doesShare) => {
    const id = generateId()
    get().items.set(id, { info, amount: 1 })
    if (doesShare) get().doesShare.add(id)
  },
  get: (id) => {
    const item = get().items.get(id)
    if (!item) return undefined
    return { ...item, doesShare: get().doesShare.has(id) }
  },
  find: (id) => get().items.has(id),
  remove: (id) => get().items.delete(id),
  setAmount: (id, amount) => {
    const item = get().items.get(id)
    if (!item) return
    get().items.set(id, { ...item, amount })
  },
  increaseAmount: (id) => {
    const item = get().items.get(id)
    if (!item) return
    get().items.set(id, { ...item, amount: item.amount + 1 })
  },
  decreaseAmount: (id) => {
    const item = get().items.get(id)
    if (!item) return
    if (item.amount === 1) return get().remove(id)
    get().items.set(id, { ...item, amount: item.amount - 1 })
  },
  clear: () => {
    get().items.clear()
    get().doesShare.clear()
  },
}))
