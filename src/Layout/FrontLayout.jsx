import { NavLink, Outlet } from "react-router-dom";

const routes = [
    { path: "/products", name: "產品列表" },
    { path: "/cart", name: "購物車" },
    { path: "/login", name: "登入" },
  ];

export default function FrontLayout(){
    return(
    <>
    <nav className="navbar navbar-expand-lg bg-primary">
        <div className="container-fluid">
            <a className="navbar-brand text-white fw-bold" href="#">Breakfast Good</a>
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNav">
                <ul className="navbar-nav">
                {routes.map((route)=>(
                    <li key={route.path} className="nav-item">
                        <NavLink className="nav-link" aria-current="page" to={route.path}>{route.name}</NavLink>
                    </li>
                ))}

                </ul>
            </div>
        </div>
    </nav>
    <Outlet/>
    </>
    )
}