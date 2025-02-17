import { createHashRouter } from "react-router-dom";
import FrontLayout from "../Layout/FrontLayOut";
import ClientProduct from "../pages/ClientProduct";
import ClientCart from "../pages/ClientCart";

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
            path: 'cart',
            element: <ClientCart />
            },
        ],
    },
]);

export default router;