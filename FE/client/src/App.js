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


function App() {
  const router = createBrowserRouter([
    { 
      path: '/',
      element: <Home />
    },
    {
      path: '/view-product/:id',
      element: <ViewProduct />
    },
    {
      path: '/shop',
      element: <Shop />
    },
    {
      path: '/login',
      element: <Login />
    },
    {
      path: '/register',
      element: <Register />
    },
    {
      path: '/forgot-password',
      element: <ForgotPassword />
    },
    {
      path: '/reset-password',
      element: <ResetPassword />
    },
    {
      path: '/profile/:id',
      element: <Profile />
    },
    {
      path: '/change-password',
      element: <ChangePassword />
    },
    {
      path: '/favourite',
      element: <Favourite />
    },
    {
      path: '/order',
      element: <OrderPage />
    },
    {
      path: '/reset',
      element: <ResetPasswordUI />
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
