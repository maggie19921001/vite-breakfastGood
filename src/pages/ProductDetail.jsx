import { useEffect, useState } from 'react'
import axios from 'axios'
import { useParams } from 'react-router-dom';
import ReactLoading from "react-loading";
const { VITE_APP_PATH } = import.meta.env;
const { VITE_APP_API } = import.meta.env;

export default function ProductDetail(){
    const [product, setProduct] = useState({});
    const [qtySelect, setQtySelect] = useState(1);
    const [loadingCartId, setLoadingCartId] = useState(null);   
    const { id:product_id } = useParams();
    const [isScreenLoading, setIsScreenLoading] = useState(false);
    
    const getProduct = async(page = 1) => {
        setIsScreenLoading(true);
        try{
            const getPdRes = await axios.get(`${VITE_APP_PATH}/v2/api/${VITE_APP_API}/product/${product_id}`);
            console.log('all products',getPdRes);
            setProduct(getPdRes.data.product);
            // setPageInfo(getPdRes.data.pagination);
    
        } catch(error){
            console.log('error in get product',error);
        }finally{
        setIsScreenLoading(false);
        }
    }
    
    useEffect(() => {
        getProduct();
    },[])

    // Cart related
    const addCartItem = async(product_id, qty) => {
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
            // getCart();
        }catch(error){
            alert('加入購物車失敗')
            console.log('error in add cart', error.response.data);
        }finally {
            setLoadingCartId(null);
            // closeProductModal();
        }
    }

    return(
        <>
        <div className="container mt-5">
            <div className="row">
                <div className="col-6">
                <img className="img-fluid" src={product.imageUrl} alt={product.title} />
                </div>
                <div className="col-6">
                <div className="d-flex align-items-center gap-2">
                    <h2>{product.title}</h2>
                    <span className="badge text-bg-success">{product.category}</span>
                </div>
                <p className="mb-3">{product.description}</p>
                <p className="mb-3">{product.content}</p>
                <h5 className="mb-3">NT$ {product.price}</h5>
                <div className="input-group align-items-center w-75">
                    <select
                    value={qtySelect}
                    onChange={(e) => setQtySelect(e.target.value)}
                    id="qtySelect"
                    className="form-select"
                    >
                    {Array.from({ length: 10 }).map((_, index) => (
                        <option key={index} value={index + 1}>
                        {index + 1}
                        </option>
                    ))}
                    </select>
                    <button
                        type="button"
                        className="btn btn-outline-danger"
                        onClick={() => addCartItem(product.id, qtySelect)}
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
                </div>
            </div>
        </div>
        {/* Loading */}
        {isScreenLoading && (
        <div
        className="d-flex justify-content-center align-items-center"
        style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(255,255,255,0.3)",
            zIndex: 999,
        }}
        >
            <ReactLoading type="spin" color="black" width="4rem" height="4rem" />
        </div>
        )}
        </>
    )
}