import { createHashRouter } from "react-router-dom";
import FrontLayout from "../Layout/FrontLayout";
import ClientProduct from "../pages/ClientProduct";
import ClientCart from "../pages/ClientCart";
import ProductDetail from "../pages/ProductDetail";
import NotFound from "../pages/NotFound";
import LoginPage from "../pages/LoginPage";

const router = createHashRouter([
    {
        path:'/',
        element: <FrontLayout />,
        children: [
            {
                path: 'products',
                element: <ClientProduct />
            },
            {
                path: 'products/:id',
                element: <ProductDetail />
            },
            {
                path: 'cart',
                element: <ClientCart />
            },
            {
                path: 'login',
                element: <LoginPage />
            },
        ],
    },{
        path:'*',
        element: <NotFound />,
    }
]);

export default router;