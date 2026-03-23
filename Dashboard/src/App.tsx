import {createBrowserRouter, RouterProvider } from "react-router-dom"
import Interface from './Interface/interface.tsx';
import ErrorPage from "./error/error.tsx";
import Login from "./Login/login.tsx";
import Update from "./Update/update.tsx";

import "./App.css"

function App(){

  const router = createBrowserRouter([
    {
      path: '/',
      element:  <Interface />,
      errorElement: <ErrorPage />,
    },
        {
      path: "/login",
      element: <Login />
    },
    {
      path: '/update',
      element: <Update />
    }
  ])
  return(<>
      <RouterProvider router={router}/>
    </>)
}
export default App