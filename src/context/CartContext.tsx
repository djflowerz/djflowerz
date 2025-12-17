'use client'
import { createContext, useContext, useState, useEffect } from 'react'

export type CartItem = {
    id: number
    title: string
    price: number
    image: string
    category: string
    product_type?: 'equipment' | 'software' | 'merch'
}

type CartContextType = {
    items: CartItem[]
    addItem: (item: CartItem) => void
    removeItem: (id: number) => void
    total: number
    isOpen: boolean
    toggleCart: () => void
    discount: number
    couponCode: string | null
    applyCoupon: (code: string, discountPercent: number) => void
    removeCoupon: () => void
}

const CartContext = createContext<CartContextType>({
    items: [],
    addItem: () => { },
    removeItem: () => { },
    total: 0,
    isOpen: false,
    toggleCart: () => { },
    discount: 0,
    couponCode: null,
    applyCoupon: () => { },
    removeCoupon: () => { }
})

export const useCart = () => useContext(CartContext)

export default function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [total, setTotal] = useState(0)
    const [discount, setDiscount] = useState(0)
    const [couponCode, setCouponCode] = useState<string | null>(null)

    useEffect(() => {
        // Calculate total
        const subtotal = items.reduce((acc, item) => acc + item.price, 0)

        let finalTotal = subtotal
        if (discount > 0) {
            const discountAmount = (subtotal * discount) / 100
            finalTotal = subtotal - discountAmount
        }

        setTotal(finalTotal)
    }, [items, discount])

    const addItem = (item: CartItem) => {
        setItems([...items, item])
        setIsOpen(true)
    }

    const removeItem = (id: number) => {
        setItems(items.filter(item => item.id !== id))
    }

    const applyCoupon = (code: string, discountPercent: number) => {
        setCouponCode(code)
        setDiscount(discountPercent)
    }

    const removeCoupon = () => {
        setCouponCode(null)
        setDiscount(0)
    }

    const toggleCart = () => setIsOpen(!isOpen)

    return (
        <CartContext.Provider value={{
            items, addItem, removeItem, total, isOpen, toggleCart,
            discount, couponCode, applyCoupon, removeCoupon
        }}>
            {children}
        </CartContext.Provider>
    )
}
