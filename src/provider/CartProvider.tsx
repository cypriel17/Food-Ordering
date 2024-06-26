import {
  PropsWithChildren,
  createContext,
  useContext,
  useState,
} from 'react';
import { CartItem, Tables } from '../types';
import { randomUUID } from 'expo-crypto';
import { useInsertOrder } from '@/api/orders';
import { router } from 'expo-router';
import { useInsertOrderItems } from '@/api/order-items';

type Product = Tables<'products'>;

type CartType = {
  items: CartItem[];
  addItem: (product: Product, size: CartItem['size']) => void;
  updateQuantity: (itemId: string, amount: 1 | -1) => void;
  total: number;
  checkout: () => void
};

const CartContext = createContext<CartType>({
  items: [],
  addItem: () => {},
  updateQuantity: () => {},
  total: 0,
  checkout: () => {}
});

export default function CartProvider({ children }: PropsWithChildren) {
  const [items, setItems] = useState<CartItem[]>([]);
  const { mutate: insertOrder } = useInsertOrder();
  const { mutate: insertOrderItems } = useInsertOrderItems();

  const total = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const addItem = (product: Product, size: CartItem['size']) => {
    const existingItem = items.find(
      (item) => item.product.id === product.id && item.size === size
    );
    if (existingItem) {
      updateQuantity(existingItem.id, 1);
      return;
    }

    const newCartItem: CartItem = {
			id: randomUUID(),
      product_id: product.id,
      product,
      size,
      quantity: 1,
    };

    setItems((existingItems) => [newCartItem, ...existingItems]);
  };

  const updateQuantity = (itemId: string, amount: 1 | -1) => {
    setItems((existingItems) =>
      existingItems
        .map((it) =>
          it.id === itemId 
          ? { ...it, quantity: it.quantity + amount } : it
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const clearCart = () => {
    setItems([])
  }

  const checkout = () => {
    console.warn('Checkout');
    insertOrder({ total }, {
      onSuccess: saveOrderItems,
    });
  };

  const saveOrderItems = (order: Tables<'orders'>) => {

    const orderItems = items.map((cartItem) => ({
        order_id: order.id,
        product_id: cartItem.product_id,
        quantity: cartItem.quantity,
        size: cartItem.size,
    }));

    insertOrderItems(
      orderItems,
     {
      onSuccess() {
        console.log(order);
        clearCart();
        router.push(`/(user)/orders/${order.id}`);
      }
    });
  };

  return (
    <CartContext.Provider value={{ items, addItem, updateQuantity, total, checkout }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);