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
  add: (info: ProductInfoType, doesShare: boolean) => Store["items"]
  get: (id: string) => (PurchaseItemType & { doesShare: boolean }) | undefined
  getAllAsObject: () => (PurchaseItemType & { id: string; doesShare: boolean })[]
  find: (id: string) => boolean
  remove: (id: string) => Store["items"]
  setAmount: (id: string, amount: number) => Store["items"]
  increaseAmount: (id: string) => Store["items"]
  decreaseAmount: (id: string) => Store["items"]
  clear: () => Store["items"]
  addAmount: (id: string, amount: number) => Store["items"]
}

export const useAddedProductsStore = create<Store & Action>((set, get) => ({
  items: new Map(),
  doesShare: new Set(),
  add: (info, doesShare) => {
    const id = generateId()
    const newItems = get().items.set(id, { info, amount: 1 })
    if (doesShare) get().doesShare.add(id)
    set({ items: newItems })
    return newItems
  },
  get: (id) => {
    const item = get().items.get(id)
    if (!item) return undefined
    return { ...item, doesShare: get().doesShare.has(id) }
  },
  getAllAsObject: () => Array.from(get().items.entries()).map(([id, item]) => ({ ...item, id, doesShare: get().doesShare.has(id) })),
  find: (id) => get().items.has(id),
  remove: (id) => {
    const newItems = get().items
    newItems.delete(id)
    set({ items: newItems })
    return newItems
  },
  setAmount: (id, amount) => {
    const item = get().items.get(id)
    if (!item) return get().items
    const newItems = get().items
    if (amount === 0) {
      return get().remove(id)
    }
    newItems.set(id, { ...item, amount })
    set({ items: newItems })
    return newItems
  },
  addAmount: (id, amount) => {
    const item = get().items.get(id)
    if (!item) return get().items
    const newItems = get().items
    const newAmount = item.amount + amount
    if (newAmount === 0) {
      return get().remove(id)
    }
    newItems.set(id, { ...item, amount: newAmount })
    set({ items: newItems })
    return newItems
  },
  increaseAmount: (id) => {
    const newItems = get().addAmount(id, 1)
    set({ items: newItems })
    return newItems
  },
  decreaseAmount: (id) => {
    const newItems = get().addAmount(id, -1)
    set({ items: newItems })
    return newItems
  },
  clear: () => {
    const newItems = new Map()
    set({ items: newItems })
    return newItems
  },
}))
