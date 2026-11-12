'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { MenuItem, getMenuItemById, migrateCustomization } from '@/data/menu';
import { STORE_SETTINGS } from '@/data/settings';

export interface ItemCustomization {
  selectedChoiceId?: string; // Stable ID, e.g. "still", "sparkling", "orange", etc.
  removedIngredientIds: string[];
  extraQuantities: Record<string, number>; // extraId -> count (1 to 3)
  notes?: string;
}

export interface CartItem {
  cartItemId: string;
  item: MenuItem;
  quantity: number;
  customization: ItemCustomization;
  unitPrice: number;
  totalPrice: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: MenuItem, quantity?: number, customization?: ItemCustomization) => void;
  updateCartItem: (cartItemId: string, newCustomization: ItemCustomization, newQuantity?: number) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  subtotal: number;
  deliveryFee: number;
  freeDeliveryThreshold: number;
  promoCode: string;
  discountAmount: number;
  applyPromoCode: (code: string) => { success: boolean; message: string };
  removePromoCode: () => void;
  orderType: 'delivery' | 'pickup';
  setOrderType: (type: 'delivery' | 'pickup') => void;
  tipPercent: number;
  setTipPercent: (percent: number) => void;
  tax: number;
  grandTotal: number;
  totalItemCount: number;
  editingCartItem: CartItem | null;
  setEditingCartItem: (item: CartItem | null) => void;
  formatItemCustomization: (cartItem: CartItem) => string[];
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'bun_patty_cart_v2';
// Storage key used before the BUN & PATTY rename (read once for migration only)
const LEGACY_CART_STORAGE_KEY = 'peach_patty_cart_v2';

/**
 * Rebuilds saved cart lines from the current menu data so renamed items, legacy IDs,
 * updated prices, images, and nutrition are always current. Lines whose item was
 * removed (or whose required choice no longer exists, e.g. a retired juice flavor)
 * are dropped; identical lines are merged.
 */
function migrateSavedCart(saved: unknown[]): CartItem[] {
  const result: CartItem[] = [];
  saved.forEach((raw) => {
    const line = raw as Partial<CartItem> & { item?: { id?: string } };
    const menuItem = line?.item?.id ? getMenuItemById(line.item.id) : undefined;
    const quantity = Math.max(1, Math.floor(Number(line?.quantity) || 1));
    if (!menuItem) return;
    const customization = migrateCustomization<ItemCustomization>(menuItem, {
      removedIngredientIds: [],
      extraQuantities: {},
      ...(line.customization || {}),
    });
    if (!customization) return;
    const cartItemId = computeCartItemId(menuItem.id, customization);
    const unitPrice = computeUnitPrice(menuItem, customization);
    const existing = result.find((r) => r.cartItemId === cartItemId);
    if (existing) {
      existing.quantity += quantity;
      existing.totalPrice = existing.unitPrice * existing.quantity;
      return;
    }
    result.push({
      cartItemId,
      item: menuItem,
      quantity,
      customization,
      unitPrice,
      totalPrice: unitPrice * quantity,
    });
  });
  return result;
}

/**
 * Computes a normalized unique key for cart items so that identical
 * customizations (regardless of order of clicking) are combined.
 */
export function computeCartItemId(itemId: string, customization?: ItemCustomization): string {
  if (!customization) return itemId;

  const choice = customization.selectedChoiceId || '';

  const sortedRemoved = [...(customization.removedIngredientIds || [])]
    .filter(Boolean)
    .sort()
    .join(',');

  const sortedExtras = Object.entries(customization.extraQuantities || {})
    .filter(([_, qty]) => qty > 0)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([id, qty]) => `${id}:${qty}`)
    .join(',');

  const cleanNote = (customization.notes || '').trim().toLowerCase();

  return `${itemId}__choice[${choice}]__rem[${sortedRemoved}]__ext[${sortedExtras}]__note[${cleanNote}]`;
}

/**
 * Calculates unit price based on base menu price + choice adjustment + extra additions
 */
export function computeUnitPrice(item: MenuItem, customization?: ItemCustomization): number {
  let price = item.price;

  if (customization?.selectedChoiceId && item.requiredChoice) {
    const opt = item.requiredChoice.options.find((o) => o.id === customization.selectedChoiceId);
    if (opt?.priceAdjustment) {
      price += opt.priceAdjustment;
    }
  }

  if (!customization?.extraQuantities) return price;

  Object.entries(customization.extraQuantities).forEach(([extraId, qty]) => {
    if (qty > 0) {
      const extraOpt = item.availableExtras?.find((e) => e.id === extraId);
      if (extraOpt) {
        price += extraOpt.price * qty;
      }
    }
  });

  return price;
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        let saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (!saved) {
          saved = localStorage.getItem(LEGACY_CART_STORAGE_KEY);
        }
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            return migrateSavedCart(parsed);
          }
        }
      } catch (e) {
        console.error('Error reading cart from localStorage', e);
      }
    }
    return [];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [promoCode, setPromoCode] = useState<string>('');
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [orderType, setOrderType] = useState<'delivery' | 'pickup'>('delivery');
  // Default tip is None (0%) as requested in issue #3
  const [tipPercent, setTipPercent] = useState<number>(STORE_SETTINGS.defaultTipPercent);
  const [editingCartItem, setEditingCartItem] = useState<CartItem | null>(null);

  // Save cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Error writing cart to localStorage', e);
    }
  }, [items]);

  const totalItemCount = useMemo(() => {
    return items.reduce((acc, curr) => acc + curr.quantity, 0);
  }, [items]);

  const subtotal = useMemo(() => {
    return items.reduce((acc, curr) => acc + curr.totalPrice, 0);
  }, [items]);

  const deliveryFee = useMemo(() => {
    if (orderType === 'pickup') return 0;
    if (items.length === 0) return 0;
    return subtotal >= STORE_SETTINGS.freeDeliveryThreshold ? 0 : STORE_SETTINGS.deliveryFee;
  }, [orderType, subtotal, items.length]);

  const discountAmount = useMemo(() => {
    return (subtotal * discountPercent) / 100;
  }, [subtotal, discountPercent]);

  const tax = useMemo(() => {
    const taxableAmount = Math.max(0, subtotal - discountAmount);
    return taxableAmount * STORE_SETTINGS.taxRate;
  }, [subtotal, discountAmount]);

  const tipAmount = useMemo(() => {
    if (tipPercent <= 0) return 0;
    const base = Math.max(0, subtotal - discountAmount);
    return (base * tipPercent) / 100;
  }, [subtotal, discountAmount, tipPercent]);

  const grandTotal = useMemo(() => {
    if (items.length === 0) return 0;
    return Math.max(0, subtotal - discountAmount + deliveryFee + tax + tipAmount);
  }, [subtotal, discountAmount, deliveryFee, tax, tipAmount, items.length]);

  const addItem = (
    menuItem: MenuItem,
    quantity: number = 1,
    customization: ItemCustomization = { removedIngredientIds: [], extraQuantities: {}, notes: '' }
  ) => {
    const cartItemId = computeCartItemId(menuItem.id, customization);
    const unitPrice = computeUnitPrice(menuItem, customization);

    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex((i) => i.cartItemId === cartItemId);
      if (existingIndex > -1) {
        const updated = [...prevItems];
        const newQty = updated[existingIndex].quantity + quantity;
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
          totalPrice: unitPrice * newQty,
        };
        return updated;
      } else {
        const newItem: CartItem = {
          cartItemId,
          item: menuItem,
          quantity,
          customization,
          unitPrice,
          totalPrice: unitPrice * quantity,
        };
        return [...prevItems, newItem];
      }
    });
  };

  const updateCartItem = (
    cartItemId: string,
    newCustomization: ItemCustomization,
    newQuantity?: number
  ) => {
    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex((i) => i.cartItemId === cartItemId);
      if (existingIndex === -1) return prevItems;

      const currentItem = prevItems[existingIndex];
      const qty = newQuantity !== undefined ? newQuantity : currentItem.quantity;
      const newCartItemId = computeCartItemId(currentItem.item.id, newCustomization);
      const unitPrice = computeUnitPrice(currentItem.item, newCustomization);

      // If key didn't change (e.g. only quantity updated or same config)
      if (newCartItemId === cartItemId) {
        const updated = [...prevItems];
        updated[existingIndex] = {
          ...currentItem,
          customization: newCustomization,
          quantity: qty,
          unitPrice,
          totalPrice: unitPrice * qty,
        };
        return updated;
      }

      // If key changed: check if target key already exists elsewhere in the cart
      const targetIndex = prevItems.findIndex((i) => i.cartItemId === newCartItemId);
      const filtered = prevItems.filter((i) => i.cartItemId !== cartItemId);

      if (targetIndex > -1 && targetIndex !== existingIndex) {
        // Merge with existing line
        return filtered.map((item) => {
          if (item.cartItemId === newCartItemId) {
            const mergedQty = item.quantity + qty;
            return {
              ...item,
              quantity: mergedQty,
              totalPrice: item.unitPrice * mergedQty,
            };
          }
          return item;
        });
      } else {
        // Replace with new line
        const updatedItem: CartItem = {
          cartItemId: newCartItemId,
          item: currentItem.item,
          quantity: qty,
          customization: newCustomization,
          unitPrice,
          totalPrice: unitPrice * qty,
        };
        return [...filtered, updatedItem];
      }
    });
  };

  const removeItem = (cartItemId: string) => {
    setItems((prev) => prev.filter((i) => i.cartItemId !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, newQty: number) => {
    if (newQty <= 0) {
      removeItem(cartItemId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => {
        if (i.cartItemId === cartItemId) {
          return {
            ...i,
            quantity: newQty,
            totalPrice: i.unitPrice * newQty,
          };
        }
        return i;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
    setPromoCode('');
    setDiscountPercent(0);
  };

  const applyPromoCode = (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    if (cleanCode === 'BUN10' || cleanCode === 'WELCOME10') {
      setPromoCode(cleanCode);
      setDiscountPercent(10);
      return { success: true, message: '10% discount applied to your order!' };
    } else if (cleanCode === 'SMASH20') {
      setPromoCode(cleanCode);
      setDiscountPercent(20);
      return { success: true, message: 'VIP 20% discount applied!' };
    } else {
      return { success: false, message: 'Invalid promo code. Try BUN10 for 10% off!' };
    }
  };

  const removePromoCode = () => {
    setPromoCode('');
    setDiscountPercent(0);
  };

  // Helper to format clean summary lines (e.g. "No onion", "Extra patty x2")
  const formatItemCustomization = (cartItem: CartItem): string[] => {
    const lines: string[] = [];
    const { item, customization } = cartItem;
    if (!customization) return lines;

    // Selected required choice (e.g. Still / Sparkling / Orange / Pomegranate)
    if (customization.selectedChoiceId && item.requiredChoice) {
      const opt = item.requiredChoice.options.find((o) => o.id === customization.selectedChoiceId);
      if (opt) {
        lines.push(opt.name);
      }
    }

    // Removed ingredients
    if (customization.removedIngredientIds && customization.removedIngredientIds.length > 0) {
      customization.removedIngredientIds.forEach((id) => {
        const found = item.includedIngredients?.find((ing) => ing.id === id);
        if (found) {
          lines.push(`No ${found.name}`);
        }
      });
    }

    // Extras with quantities
    if (customization.extraQuantities) {
      Object.entries(customization.extraQuantities).forEach(([extraId, count]) => {
        if (count > 0) {
          const extraOpt = item.availableExtras?.find((e) => e.id === extraId);
          if (extraOpt) {
            lines.push(`Extra ${extraOpt.name}${count > 1 ? ` x${count}` : ''}`);
          }
        }
      });
    }

    return lines;
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        updateCartItem,
        removeItem,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        subtotal,
        deliveryFee,
        freeDeliveryThreshold: STORE_SETTINGS.freeDeliveryThreshold,
        promoCode,
        discountAmount,
        applyPromoCode,
        removePromoCode,
        orderType,
        setOrderType,
        tipPercent,
        setTipPercent,
        tax,
        grandTotal,
        totalItemCount,
        editingCartItem,
        setEditingCartItem,
        formatItemCustomization,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
