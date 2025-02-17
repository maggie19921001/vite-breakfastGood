import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import ReactLoading from "react-loading";
import { Modal } from 'bootstrap';
import { useForm } from 'react-hook-form';

const { VITE_APP_PATH } = import.meta.env;
const { VITE_APP_API } = import.meta.env;

export default function ClientProduct(){
    const [products, setProducts] = useState([]);
    // Cart related
    const addCart = async(product_id, qty) => {
        setLoadingCartId(product_id)
        try{
            const url = `${VITE_APP_PATH}/v2/api/${VITE_APP_API}/cart`;
            const addCartRes = await axios.post(url, {
                data:{
                    product_id,
                    qty: Number(qty)
                }
            });
            console.log(addCartRes);
            // alert(addCartRes.data.message);
            getCart();
        }catch(error){
            alert('加入購物車失敗')
            console.log('error in add cart', error.response.data);
        }finally {
            setLoadingCartId(null);
            closeProductModal();
        }
    }
    const [loadingProductId, setLoadingProductId] = useState(null);
    const [loadingCartId, setLoadingCartId] = useState(null);
    return(
        <>
        {/* 產品列表 */}
        <table className="table align-middle">
            <thead>
            <tr>
                <th>圖片</th>
                <th>產品名稱</th>
                <th>價錢</th>
                <th></th>
            </tr>
            </thead>
            <tbody>
            {products.map((product) => (
                <tr key={product.id}>
                <td style={{ width: "200px" }}>
                    <div
                    style={{
                        height: "100px",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundImage: `url(${product.imageUrl})`,
                    }}
                    />
                </td>
                <td>{product.title}</td>
                <td>
                    <del className="h6">
                    原價： { product.origin_price } 元
                    </del>
                    <div className="h5">特價： { product.price } 元</div>
                </td>
                <td>
                    <div className="btn-group btn-group-sm">
                    <button
                        className="btn btn-outline-secondary"
                        onClick={() => openModal(product.id)}
                        disabled={loadingProductId === product.id}
                    >
                        {loadingProductId === product.id ? (
                        <ReactLoading
                            type="spin"
                            color="#6c757d"
                            height={20}
                            width={20}
                        />
                        ) : (
                        "查看更多"
                        )}
                    </button>
                    <button
                        type="button"
                        className="btn btn-outline-danger"
                        onClick={() => addCart(product.id, 1)}
                        disabled={loadingCartId === product.id}
                    >
                        {loadingCartId === product.id ? (
                        <ReactLoading
                            type="spin"
                            color="#dc3545"
                            height={20}
                            width={20}
                        />
                        ) : (
                        "加入購物車"
                        )}
                    </button>
                    </div>
                </td>
                </tr>
            ))}
            </tbody>
        </table>
        </>
    )
}