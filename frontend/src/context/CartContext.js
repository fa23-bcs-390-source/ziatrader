import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { cartAPI } from '../utils/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

// ─── CART CONTEXT ──────────────────────────────────────────────────────────────
const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'SET_CART':   return { ...state, items: action.payload, loading: false };
    case 'SET_LOADING': return { ...state, loading: action.payload };
    case 'CLEAR':      return { ...state, items: [] };
    default: return state;
  }
};

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(cartReducer, { items: [], loading: false });

  const fetchCart = async () => {
    if (!user) return;
    try {
      const { data } = await cartAPI.get();
      dispatch({ type: 'SET_CART', payload: data.cart });
    } catch {}
  };

  useEffect(() => { fetchCart(); }, [user]);

  const addToCart = async (productId, quantity = 1) => {
    if (!user) { toast.error('Please login to add items to cart'); return; }
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const { data } = await cartAPI.add(productId, quantity);
      dispatch({ type: 'SET_CART', payload: data.cart });
      toast.success('Added to cart! 🛒');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add to cart');
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      const { data } = await cartAPI.update(productId, quantity);
      dispatch({ type: 'SET_CART', payload: data.cart });
    } catch {}
  };

  const removeFromCart = async (productId) => {
    try {
      await cartAPI.remove(productId);
      dispatch({ type: 'SET_CART', payload: state.items.filter(i => i.product?._id !== productId) });
      toast.success('Item removed from cart');
    } catch {}
  };

  const clearCart = async () => {
    try {
      await cartAPI.clear();
      dispatch({ type: 'CLEAR' });
    } catch {}
  };

  const cartCount = state.items.reduce((sum, i) => sum + (i.quantity || 0), 0);
  const cartTotal = state.items.reduce((sum, i) => {
    const price = i.product?.discountedPrice || i.product?.price || 0;
    return sum + price * (i.quantity || 0);
  }, 0);

  return (
    <CartContext.Provider value={{ ...state, cartCount, cartTotal, addToCart, updateQuantity, removeFromCart, clearCart, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);


// ─── NOTIFICATION CONTEXT ─────────────────────────────────────────────────────
const NotifContext = createContext();

export const NotifProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = React.useState([]);
  const [unread, setUnread] = React.useState(0);

  const fetchNotifs = async () => {
    if (!user) return;
    try {
      const { notifAPI } = await import('../utils/api');
      const { data } = await notifAPI.getAll();
      setNotifications(data.notifications);
      setUnread(data.notifications.filter(n => !n.isRead).length);
    } catch {}
  };

  useEffect(() => { fetchNotifs(); }, [user]);

  const addNotif = (notif) => {
    setNotifications(prev => [notif, ...prev]);
    setUnread(prev => prev + 1);
  };

  return (
    <NotifContext.Provider value={{ notifications, unread, fetchNotifs, addNotif }}>
      {children}
    </NotifContext.Provider>
  );
};

export const useNotif = () => useContext(NotifContext);
