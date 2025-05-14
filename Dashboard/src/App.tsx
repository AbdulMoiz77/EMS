import React, { useEffect, useState } from 'react';
import {createBrowserRouter, RouterProvider } from "react-router-dom"
import Interface from './Interface/interface.tsx';
import Login from './Login/login.jsx';
import Update from './Update/update.tsx';

import "./App.css"

function App(){

  const router = createBrowserRouter([
    {
      path: '/',
      element:  <Interface />
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