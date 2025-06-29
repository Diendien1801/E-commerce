import Home from './home/page';
import {createBrowserRouter, RouterProvider} from 'react-router-dom';
import './App.css';

function App() {
  const router = createBrowserRouter([
    { 
      path: '/',
      element: <Home />
    }
  ]);

  return (
    <div className="App">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
