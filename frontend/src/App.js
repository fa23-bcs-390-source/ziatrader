import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { NotifProvider } from './context/CartContext';
import Layout from './components/common/Layout';
import AdminLayout from './components/admin/AdminLayout';
import AgronomistLayout from './components/agronomist/AgronomistLayout';
import Spinner from './components/common/Spinner';

const Home          = lazy(() => import('./pages/Home'));
const Products      = lazy(() => import('./pages/Products'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const About         = lazy(() => import('./pages/About'));
const Cart          = lazy(() => import('./pages/Cart'));
const Checkout      = lazy(() => import('./pages/Checkout'));
const Orders        = lazy(() => import('./pages/Orders'));
const OrderDetail   = lazy(() => import('./pages/OrderDetail'));
const Profile       = lazy(() => import('./pages/Profile'));
const Login         = lazy(() => import('./pages/Login'));
const Register      = lazy(() => import('./pages/Register'));
const Blog          = lazy(() => import('./pages/Blog'));
const BlogDetail    = lazy(() => import('./pages/BlogDetail'));
const Chat          = lazy(() => import('./pages/Chat'));
const Agronomist    = lazy(() => import('./pages/Agronomist'));
const Queries       = lazy(() => import('./pages/Queries'));
const NotFound      = lazy(() => import('./pages/NotFound'));

const SellerDashboard = lazy(() => import('./pages/seller/Dashboard'));
const SellerProducts  = lazy(() => import('./pages/seller/Products'));
const SellerOrders    = lazy(() => import('./pages/seller/Orders'));
const SellerShop      = lazy(() => import('./pages/seller/Shop'));

const AdminDashboard  = lazy(() => import('./pages/admin/Dashboard'));
const AdminUsers      = lazy(() => import('./pages/admin/Users'));
const AdminProducts   = lazy(() => import('./pages/admin/Products'));
const AdminOrders     = lazy(() => import('./pages/admin/Orders'));
const AdminCategories = lazy(() => import('./pages/admin/Categories'));
const AdminCoupons    = lazy(() => import('./pages/admin/Coupons'));
const AdminShops      = lazy(() => import('./pages/admin/Shops'));
const AdminCMS        = lazy(() => import('./pages/admin/CMS'));
const AdminWarehouses = lazy(() => import('./pages/admin/Warehouses'));
const AdminStaff      = lazy(() => import('./pages/admin/Staff'));
const AdminExpenses   = lazy(() => import('./pages/admin/Expenses'));
const AdminFinance    = lazy(() => import('./pages/admin/Finance'));
const AdminLogistics  = lazy(() => import('./pages/admin/Logistics'));
const AdminInventory  = lazy(() => import('./pages/admin/Inventory'));

const AgroDashboard     = lazy(() => import('./pages/agronomist/Dashboard'));
const AgroQueries       = lazy(() => import('./pages/agronomist/Queries'));
const AgroAppointments  = lazy(() => import('./pages/agronomist/Appointments'));

const PrivateRoute = ({ children, roles }) => {
  const { user, token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user?.role)) return <Navigate to="/" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { token } = useAuth();
  if (token) return <Navigate to="/" replace />;
  return children;
};

const AppRoutes = () => (
  <Suspense fallback={<div className="page-loader"><Spinner /></div>}>
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="products" element={<Products />} />
        <Route path="products/:id" element={<ProductDetail />} />
        <Route path="about" element={<About />} />
        <Route path="blog" element={<Blog />} />
        <Route path="blog/:slug" element={<BlogDetail />} />

        <Route path="login"    element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="register" element={<PublicRoute><Register /></PublicRoute>} />

        <Route path="cart"      element={<PrivateRoute><Cart /></PrivateRoute>} />
        <Route path="checkout"  element={<PrivateRoute><Checkout /></PrivateRoute>} />
        <Route path="orders"    element={<PrivateRoute><Orders /></PrivateRoute>} />
        <Route path="orders/:id" element={<PrivateRoute><OrderDetail /></PrivateRoute>} />
        <Route path="profile"   element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="queries"   element={<PrivateRoute><Queries /></PrivateRoute>} />
        <Route path="chat"      element={<PrivateRoute><Chat /></PrivateRoute>} />
        <Route path="agronomist" element={<PrivateRoute><Agronomist /></PrivateRoute>} />

        <Route path="seller/dashboard" element={<PrivateRoute roles={['seller']}><SellerDashboard /></PrivateRoute>} />
        <Route path="seller/products"  element={<PrivateRoute roles={['seller']}><SellerProducts /></PrivateRoute>} />
        <Route path="seller/orders"    element={<PrivateRoute roles={['seller']}><SellerOrders /></PrivateRoute>} />
        <Route path="seller/shop"      element={<PrivateRoute roles={['seller']}><SellerShop /></PrivateRoute>} />
      </Route>

      <Route path="/admin" element={<PrivateRoute roles={['admin']}><AdminLayout /></PrivateRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="users"      element={<AdminUsers />} />
        <Route path="products"   element={<AdminProducts />} />
        <Route path="orders"     element={<AdminOrders />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="coupons"    element={<AdminCoupons />} />
        <Route path="cms"        element={<AdminCMS />} />
        <Route path="shops"      element={<AdminShops />} />
        <Route path="warehouses" element={<AdminWarehouses />} />
        <Route path="staff"      element={<AdminStaff />} />
        <Route path="expenses"   element={<AdminExpenses />} />
        <Route path="finance"    element={<AdminFinance />} />
        <Route path="logistics"  element={<AdminLogistics />} />
        <Route path="inventory"  element={<AdminInventory />} />
      </Route>

      <Route path="/agronomist-portal" element={<PrivateRoute roles={['agronomist', 'admin']}><AgronomistLayout /></PrivateRoute>}>
        <Route index element={<AgroDashboard />} />
        <Route path="queries" element={<AgroQueries />} />
        <Route path="appointments" element={<AgroAppointments />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  </Suspense>
);

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <NotifProvider>
            <AppRoutes />
            <Toaster
              position="top-right"
              toastOptions={{
                style: { borderRadius: '12px', fontFamily: 'DM Sans, sans-serif', fontSize: '0.875rem' },
                success: { iconTheme: { primary: '#1e3a5f', secondary: '#fff' } },
              }}
            />
          </NotifProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
