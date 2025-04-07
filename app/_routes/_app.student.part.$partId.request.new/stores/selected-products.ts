import { create } from "zustand"

type ProductInfoType = {
  name: string
  price: number
}

type PurchaseItemType = {
  info: ProductInfoType
  amount: number
}

type Store = {
  items: Map<string, PurchaseItemType>
}

type Action = {
  add: (info: ProductInfoType, id: string) => Store["items"]
  get: (id: string) => PurchaseItemType | undefined
  getAllAsObject: () => (PurchaseItemType & { id: string })[]
  find: (id: string) => boolean
  remove: (id: string) => Store["items"]
  setAmount: (id: string, amount: number) => Store["items"]
  addAmount: (id: string, amount: number) => Store["items"]
  increaseAmount: (id: string) => Store["items"]
  decreaseAmount: (id: string) => Store["items"]
  clear: () => Store["items"]
}

export const useSelectedProductsStore = create<Store & Action>((set, get) => ({
  items: new Map(),
  add: (info, id) => {
    const newItems = get().items.set(id, { info, amount: 1 })
    set({ items: newItems })
    return newItems
  },
  get: (id) => {
    const item = get().items.get(id)
    if (!item) return undefined
    return item
  },
  getAllAsObject: () => Array.from(get().items.entries()).map(([id, item]) => ({ ...item, id })),
  find: (id) => get().items.has(id),
  remove: (id) => {
    const newItems = get().items
    newItems.delete(id)
    set({ items: newItems })
    return newItems
  },
  setAmount: (id, amount) => {
    const item = get().get(id)
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
    const item = get().get(id)
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
