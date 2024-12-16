import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Provider } from 'react-redux'
import store, { persistor } from './store/store.js'
import { PersistGate } from 'redux-persist/integration/react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
// import {Protected} from './components/index.js'

import {Home, Login, Signup, AddProduct, ViewProduct, AllProducts, UserProfile, EditProfile} from './pages/index.js'

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
        {
            path: "/",
            element: <Home />,
        },
        {
          path: "/login",
          element: <Login />,
        },
        {
          path: "/signup",
          element: <Signup />,
        },
        {
          path: "/add-product",
          element: <AddProduct />,
        },
        {
          path: "/products/:productId",
          element: <ViewProduct />
        },
        {
          path: "/products/allproducts",
          element: <AllProducts />
        },
        {
          path: "/users/:userId",
          element: <UserProfile />
        },
        {
          path: "/users/edit/:userId",
          element: <EditProfile />
        },
    ],
  },
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={false} persistor={persistor}>
        <RouterProvider router={router} />
      </PersistGate>
    </Provider>
  </StrictMode>,
)

