import Home from './home/page';
import {createBrowserRouter, RouterProvider} from 'react-router-dom';

import Shop from './shop/page';
import ViewProduct from './view-product/page';
import './App.css';


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
    }

  ]);

  return (
    <div className="App">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
