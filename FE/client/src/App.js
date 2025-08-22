import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from './components/context/authcontext';
import './i18n';
import './App.css';
import ToastProvider from "./components/toast/ToastProvider.jsx";
import Home from './home/page';
import Login from './authentication/login/page';
import Shop from './shop/page';
import ViewProduct from './view-product/page';
import Register from './authentication/register/page';
import Profile from './profile/page';
import ForgotPassword from './authentication/forgot-password/page';
import ResetPassword from './authentication/reset-password/page';
import ChangePassword from './authentication/change-password/page';
import Favourite from './favourite/page';
import OrderPage from './order/page';
import ResetPasswordUI from './authentication/reset-ui/page';
import Cart from './cart/page';

// Admin pages
import AdminDashboard from './admin/home/page'; 
import Dashboard from './admin/analysis/dashboard';
import UserManagement from './admin/users/userManage/page';
import UserDetail from './admin/users/userDetails/page';
import ProductManagement from './admin/products/page';
import ProductDetail from './admin/product-detail/page';
import AddProduct from './admin/create-product/page';
import OrderManage from './admin/orders/page';

import CategoryManagement from './admin/category/page';
import CrawlPage from './admin/crawl/page';

import Payment from './payment/page';
import PaymentResult from './paymentResult/payment-result'; 





function App() {
  const router = createBrowserRouter([
    // Public routes
    { path: "/", element: <Home /> },
    { path: "/view-product/:id", element: <ViewProduct /> },
    { path: "/shop", element: <Shop /> },
    { path: "/login", element: <Login /> },
    { path: "/register", element: <Register /> },
    { path: "/forgot-password", element: <ForgotPassword /> },
    { path: "/reset-password", element: <ResetPassword /> },
    { path: "/profile/:id", element: <Profile /> },
    { path: "/change-password", element: <ChangePassword /> },
    { path: "/favourite", element: <Favourite /> },
    { path: "/order", element: <OrderPage /> },
    { path: "/reset", element: <ResetPasswordUI /> },
    { path: "/cart", element: <Cart /> },
    
    {
      path: "/payment",
      element: <Payment />
    }
    ,
    {
      path: "/payment-result",
      element: <PaymentResult />
    },
    // Admin routes (nested)
    {
      path: "/admin",
      element: <AdminDashboard />, // Always visible layout
      children: [
        { path: "dashboard", element: <Dashboard /> },
        { path: "users", element: <UserManagement /> },
        { path: "users/:userId", element: <UserDetail /> },
        { path: "products", element: <ProductManagement /> },
        { path: "products/:id", element: <ProductDetail /> },
        { path: "create-product", element: <AddProduct /> },
        { path: "orders", element: <OrderManage /> },
        { path: "categories", element: <CategoryManagement /> },
        { path: "crawl", element: <CrawlPage /> }
      ],
    },

    
    
    

  ]);

  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
