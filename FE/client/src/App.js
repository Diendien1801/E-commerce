import './i18n';
import { AuthProvider } from './components/context/authcontext';
import Home from './home/page';
import {createBrowserRouter, RouterProvider} from 'react-router-dom';
import Login from './authentication/login/page';
import Shop from './shop/page';
import ViewProduct from './view-product/page';
import Register from './authentication/register/page';
import Profile from './profile/page';
import ForgotPassword from './authentication/forgot-password/page';
import ResetPassword from './authentication/reset-password/page';
import ChangePassword from './authentication/change-password/page';
import Favourite from './favourite/page';
import './App.css';
import OrderPage from './order/page';
import ResetPasswordUI from './authentication/reset-ui/page';

import UserManagement from './admin/users/userManage/page';
import UserDetail from './admin/users/userDetails/page';
//import DashboardPage from './admin/status/page';
import ProductManagement from './admin/products/page';
import ProductDetail from './admin/product-detail/page';
import AddProduct from './admin/create-product/page';

import OrderManage from './admin/orders/page';
import Dashboard from './admin/analysis/dashboard';
import Payment from './payment/page';
import PaymentResult from './paymentResult/payment-result'; 
import Cart from './cart/page';




function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Home />,
    },
    {
      path: "/view-product/:id",
      element: <ViewProduct />,
    },
    {
      path: "/shop",
      element: <Shop />,
    },
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/register",
      element: <Register />,
    },
    {
      path: "/forgot-password",
      element: <ForgotPassword />,
    },
    {
      path: "/reset-password",
      element: <ResetPassword />,
    },
    {
      path: "/profile/:id",
      element: <Profile />,
    },
    {
      path: "/change-password",
      element: <ChangePassword />,
    },
    {
      path: "/favourite",
      element: <Favourite />,
    },
    {
      path: "/order",
      element: <OrderPage />,
    },
    {
      path: "/reset",
      element: <ResetPasswordUI />,
    },
    {
      path: "/admin/users",
      element: <UserManagement />,
    },
    {
      path: "/admin/users/:userId",
      element: <UserDetail />,
    },
    // {
    //   path: '/admin/status',
    //   element: <DashboardPage />
    // },
    {
      path: "/cart",
      element: <Cart />,
    },
    {
      path: "/admin/products",
      element: <ProductManagement />,
    },
    {
      path: '/admin/create-product',
      element: <AddProduct />

    },
    {
      path: '/admin/orders',
      element: <OrderManage />
    },
    {
      path: '/admin/dashboard',
      element: <Dashboard />
    },
    {
      path: "/admin/products/:id",
      element: <ProductDetail />,
    },
    {
      path: "/payment",
      element: <Payment />
    }
    ,
    {
      path: "/payment-result",
      element: <PaymentResult />
    }
    
  ]);

  return (
    <AuthProvider>
      <div className="App">
        <RouterProvider router={router} />
      </div>
    </AuthProvider>
  );
}

export default App;
