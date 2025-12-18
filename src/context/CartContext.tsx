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
    shipping: number
    shippingMethod: string | null
    couponCode: string | null
    applyCoupon: (code: string) => boolean
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
    shipping: 0,
    shippingMethod: null,
    couponCode: null,
    applyCoupon: () => false,
    removeCoupon: () => { }
})

export const useCart = () => useContext(CartContext)

export default function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [total, setTotal] = useState(0)
    const [discount, setDiscount] = useState(0)
    const [couponCode, setCouponCode] = useState<string | null>(null)
    const [shipping, setShipping] = useState(0)
    const [shippingMethod, setShippingMethod] = useState<string | null>(null)

    useEffect(() => {
        // Calculate subtotal
        const subtotal = items.reduce((acc, item) => acc + item.price, 0)

        // Calculate discount
        let discountAmount = 0
        if (couponCode === 'DJFLOWERZ' && items.length > 0) {
            discountAmount = subtotal * 0.20 // 20% discount
        }

        // Calculate shipping
        let shippingFee = 0
        const hasEquipment = items.some(item => item.product_type === 'equipment')
        if (hasEquipment) {
            shippingFee = 1500 // Flat equipment shipping fee (adjustable)
        }

        setDiscount(discountAmount)
        setShipping(shippingFee)
        setTotal(subtotal - discountAmount + shippingFee)
    }, [items, couponCode])

    const addItem = (item: CartItem) => {
        setItems([...items, item])
        setIsOpen(true)
    }

    const removeItem = (id: number) => {
        setItems(items.filter(item => item.id !== id))
    }

    const applyCoupon = (code: string) => {
        if (code.toUpperCase() === 'DJFLOWERZ') {
            setCouponCode('DJFLOWERZ')
            return true
        }
        return false
    }

    const removeCoupon = () => {
        setCouponCode(null)
        setDiscount(0)
    }

    const toggleCart = () => setIsOpen(!isOpen)

    return (
        <CartContext.Provider value={{
            items, addItem, removeItem, total, isOpen, toggleCart,
            discount, shipping, shippingMethod, couponCode, applyCoupon, removeCoupon
        }}>
            {children}
        </CartContext.Provider>
    )
}
