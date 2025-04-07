import { create } from "zustand"

type ProductInfoType = {
  name: string
  price: number
}

type PurchaseItemType = {
  info: ProductInfoType
  quantity: number
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
  setQuantity: (id: string, quantity: number) => Store["items"]
  increaseQuantity: (id: string) => Store["items"]
  decreaseQuantity: (id: string) => Store["items"]
  clear: () => Store["items"]
  addQuantity: (id: string, quantity: number) => Store["items"]
}

export const useProductSelectStore = create<Store & Action>((set, get) => ({
  items: new Map(),
  add: (info, id) => {
    const newItems = get().items.set(id, { info, quantity: 1 })
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
  setQuantity(id, quantity) {
    const item = get().get(id)
    if (!item) return get().items
    const newItems = get().items
    if (quantity === 0) {
      return get().remove(id)
    }
    newItems.set(id, { ...item, quantity })
    set({ items: newItems })
    return newItems
  },
  addQuantity: (id, quantity) => {
    const item = get().get(id)
    if (!item) return get().items
    const newItems = get().items
    const newQuantity = item.quantity + quantity
    if (newQuantity === 0) {
      return get().remove(id)
    }
    newItems.set(id, { ...item, quantity: newQuantity })
    set({ items: newItems })
    return newItems
  },
  increaseQuantity: (id) => {
    const newItems = get().addQuantity(id, 1)
    set({ items: newItems })
    return newItems
  },
  decreaseQuantity: (id) => {
    const newItems = get().addQuantity(id, -1)
    set({ items: newItems })
    return newItems
  },
  clear: () => {
    const newItems = new Map()
    set({ items: newItems })
    return newItems
  },
}))
