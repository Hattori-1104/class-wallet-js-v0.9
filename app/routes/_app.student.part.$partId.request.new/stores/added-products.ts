import { create } from "zustand"

type AddedProductType = {
  id: string
  name: string
  amount: number
  price: number
  description?: string
  share: boolean
}

type Store = {
  addedProducts: AddedProductType[]
}

type Action = {
  getProduct: (id: string) => AddedProductType | undefined
  getAllProducts: () => AddedProductType[]
  addProduct: (product: AddedProductType) => void
  removeProduct: (id: string) => void
  setAmount: (id: string, amount: number) => void
  increaseAmount: (id: string) => void
  decreaseAmount: (id: string) => void
  clear: () => void
}

export const useAddedProductsStore = create<Store & Action>((set, get) => ({
  addedProducts: [],
  getProduct: (id) => get().addedProducts.find((product) => product.id === id),
  getAllProducts: () => get().addedProducts,
  addProduct: (product) => set((state) => ({ addedProducts: [...state.addedProducts, product] })),
  removeProduct: (id) => set((state) => ({ addedProducts: state.addedProducts.filter((product) => product.id !== id) })),
  setAmount: (id, amount) => {
    const product = get().getProduct(id)
    if (!product) return
    if (amount === 0) {
      get().removeProduct(id)
      return
    }
    set((state) => ({ addedProducts: state.addedProducts.map((product) => (product.id === id ? { ...product, amount } : product)) }))
  },
  increaseAmount: (id) => get().setAmount(id, (get().getProduct(id)?.amount ?? 0) + 1),
  decreaseAmount: (id) => get().setAmount(id, (get().getProduct(id)?.amount ?? 0) - 1),
  clear: () => set({ addedProducts: [] }),
}))
