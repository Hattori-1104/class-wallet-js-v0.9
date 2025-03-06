import { Product } from "@prisma/client"
import { create } from "zustand"

type SelectedProductType = {
  name: string
  price: number
  amount: number
}

type Store = {
  selectedProducts: Map<string, SelectedProductType>
}

type Action = {
  getProduct: (id: string) => SelectedProductType | undefined
  getAllProducts: () => (SelectedProductType & { id: string })[]
  addProduct: (product: Pick<Product, "id" | "name" | "price"> & { amount?: number }) => void
  removeProduct: (id: string) => void
  setAmount: (id: string, amount: number) => void
  increaseAmount: (id: string) => void
  decreaseAmount: (id: string) => void
  clear: () => void
}

export const useSelectedProductsStore = create<Store & Action>((set, get) => ({
  selectedProducts: new Map(),
  getAllProducts: () => Array.from(get().selectedProducts.entries()).map(([id, product]) => ({ ...product, id })),
  getProduct: (id) => get().selectedProducts.get(id),
  addProduct: (product) =>
    set((state) => ({ selectedProducts: state.selectedProducts.set(product.id, { name: product.name, price: product.price, amount: product.amount ?? 1 }) })),
  removeProduct: (id) =>
    set((state) => {
      const newSelectedProducts = new Map(state.selectedProducts)
      newSelectedProducts.delete(id)
      return { selectedProducts: newSelectedProducts }
    }),
  setAmount: (id, amount) => {
    const product = get().getProduct(id)
    if (!product) return
    if (amount === 0) {
      get().removeProduct(id)
      return
    }
    set((state) => ({ selectedProducts: state.selectedProducts.set(id, { ...product, amount }) }))
  },
  increaseAmount: (id) => get().setAmount(id, (get().getProduct(id)?.amount ?? 0) + 1),
  decreaseAmount: (id) => get().setAmount(id, (get().getProduct(id)?.amount ?? 0) - 1),
  clear: () => set({ selectedProducts: new Map() }),
}))
