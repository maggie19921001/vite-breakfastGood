import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import ReactLoading from "react-loading";
import { Modal } from 'bootstrap';
import { useForm } from 'react-hook-form';

const { VITE_APP_PATH } = import.meta.env;
const { VITE_APP_API } = import.meta.env;

function ClientPage(){

    const [products, setProducts] = useState([]);
    const [product, setProduct] = useState({});
    const productModalRef = useRef(null);

    const [loadingProductId, setLoadingProductId] = useState(null);
    const [loadingCartId, setLoadingCartId] = useState(null);

    const [isScreenLoading, setIsScreenLoading] = useState(false);
    // const [pageInfo,setPageInfo] = useState({});

    const [cartQuantity, setCartQuantity] = useState(1);
    const [cart, setCart] = useState({});

    const getProducts = async(page = 1) => {
        setIsScreenLoading(true);
        try{
            const getPdRes = await axios.get(`${VITE_APP_PATH}/v2/api/${VITE_APP_API}/products/all?page=${page}`);
            console.log('all products',getPdRes);
            setProducts(getPdRes.data.products);
            // setPageInfo(getPdRes.data.pagination);
    
        } catch(error){
            console.log('error in get product',error);
        }finally{
        setIsScreenLoading(false);
        }
    }
    
    useEffect(() => {
        getProducts();
        getCart();
    },[])

    //   取得單一產品
    const getProduct = async (id) => {
        setLoadingProductId(id);
        try {
            const url = `${VITE_APP_PATH}/v2/api/${VITE_APP_API}/product/${id}`;
            const response = await axios.get(url);
            setProduct(response.data.product);
            console.log(response);
        } catch (error) {
            alert('無法取得產品資訊')
            console.log('error in get product', error.response.data);
        } finally {
            setLoadingProductId(null);
        }
    };

    // Modal Create & Functions
    useEffect(() => {
        new Modal(productModalRef.current, {backdrop: false}); 
    },[]);

    const openModal = async (id) => {
        await getProduct(id);
        const productModal = Modal.getInstance(productModalRef.current);
        productModal.show();
    };

    const closeProductModal = () => {
        const productModal = Modal.getInstance(productModalRef.current);
        productModal.hide();
    }

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

    const getCart = async() => {
        try{
            const url = `${VITE_APP_PATH}/v2/api/${VITE_APP_API}/cart`;
            const getCartRes = await axios.get(url);
            setCart(getCartRes.data.data)
            console.log("cart",getCartRes.data.data);
        }catch(error){
            console.log('error in get cart', error);
        }
    }

    const clearCart = async()=>{
        setIsScreenLoading(true);
        try{
            const url = `${VITE_APP_PATH}/v2/api/${VITE_APP_API}/carts`;
            const clearCartRes = await axios.delete(url);
            getCart();
        }catch(error){
            console.log('error in clear cart', error);
        }finally{
            setIsScreenLoading(false);
        }
    }

    const deleteCartItem = async(cartItem_id)=>{
        setIsScreenLoading(true);
        try{
            const url = `${VITE_APP_PATH}/v2/api/${VITE_APP_API}/cart/${cartItem_id}`;
            const delCartRes = await axios.delete(url);
            getCart();
        }catch(error){
            console.log('error in delete cart item', error);
        }finally{
            setIsScreenLoading(false);
        }
    }

    const updateCartItem = async(cartItem_id, product_id, qty)=>{
        setIsScreenLoading(true);
        try{
            const url = `${VITE_APP_PATH}/v2/api/${VITE_APP_API}/cart/${cartItem_id}`;
            const delCartRes = await axios.put(url, {
                data:{
                    product_id,
                    qty: Number(qty)
                }
            });
            getCart();
        }catch(error){
            console.log('error in update cart item', error);
        }finally{
            setIsScreenLoading(false);
        }
    }

    // Form related

    const { register, handleSubmit, formState:{errors}, reset } = useForm();
    const onSubmit = handleSubmit((data)=>{
        console.log(data);
        const { message, ...user } = data;
        const userInfo = {
            data:{
                user,
                message
            }
        }
        submitOrder(userInfo);
        getCart();
    })

    const submitOrder = async(data)=>{
        setIsScreenLoading(true);
        try{
            const url = `${VITE_APP_PATH}/v2/api/${VITE_APP_API}/order`;
            const orderRes = await axios.post(url, data);
            console.log(orderRes);
            alert(orderRes.data.message);
            reset();
        }catch(error){
            console.log('error in submit order', error);
        }finally{
            setIsScreenLoading(false);
        }
    }

    return(<>

    <div className="container mt-5">
        {/* Product Modal */}
        <div className="modal" id="productModal" ref={productModalRef}>
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">{product.title}</h5>
                        <button
                            type="button"
                            className="btn-close"
                            data-bs-dismiss="modal"
                            aria-label="Close"
                        ></button>
                    </div>
                    <div className="modal-body">
                        <img className="w-100" src={product.imageUrl} />
                        <p className="mt-3">產品內容：{product.content}</p>
                        <p>產品描述：{product.description}</p>
                        <p>
                            價錢：<del>原價 ${product.origin_price}</del>，特價：$
                            {product.price}
                        </p>
                        <div className="d-flex align-items-center gap-2">
                            <label style={{ width: "150px" }}>購買數量：</label>
                            <button
                            className="btn btn-primary"
                            type="button"
                            aria-label="Decrease quantity"
                            onClick={() =>
                                setCartQuantity((pre) => (pre === 1 ? pre : pre - 1))
                            }
                            >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-dash" viewBox="0 0 16 16">
                                <path d="M4 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 4 8"/>
                            </svg>
                            </button>
                            <input
                            className="form-control"
                            type="number"
                            value={cartQuantity}
                            min="1"
                            onChange={(e) => setCartQuantity(Number(e.target.value))}
                            />
                            <button
                            className="btn btn-primary"
                            type="button"
                            aria-label="Decrease quantity"
                            onClick={() => setCartQuantity((pre) => pre + 1)}
                            >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-plus" viewBox="0 0 16 16">
                                <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"/>
                            </svg>
                            </button>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() => addCart(product.id, cartQuantity)}
                            disabled={loadingCartId === product.id}
                        >
                            {loadingCartId === product.id ? (
                            <ReactLoading
                                type="spin"
                                height={20}
                                width={20}
                            />
                            ) : (
                            "加入購物車")}
                        </button>
                    </div>
                </div>
            </div>
        </div>

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

        {/* 分頁 */}
        {/* <nav aria-label="Page navigation example">
            <ul className="pagination">
            <li className="page-item">
                <a
                href="/"
                aria-label="Previous"
                className={`page-link ${pageInfo.has_pre ? "" : "disabled"}`}
                onClick={(event) =>
                    handleClick(event, pageInfo.current_page - 1)
                }
                >
                <span aria-hidden="true">&laquo;</span>
                </a>
            </li>
            {[...new Array(pageInfo.total_pages)].map((_, i) => (
                <li className="page-item" key={`${i}_page`}>
                <a
                    className={`page-link ${
                    i + 1 === pageInfo.current_page && "active"
                    }`}
                    href="/"
                    onClick={(event) => handleClick(event, i + 1)}
                >
                    {i + 1}
                </a>
                </li>
            ))}
            <li className="page-item">
                <a
                className={`page-link ${pageInfo.has_next ? "" : "disabled"}`}
                onClick={(event) =>
                    handleClick(event, pageInfo.current_page + 1)
                }
                href="/"
                aria-label="Next"
                >
                <span aria-hidden="true">&raquo;</span>
                </a>
            </li>
            </ul>
        </nav> */}

        {/* 購物車列表 */}
        {cart.carts?.length > 0 && (<div>
            <div className="text-end">
                <button
                className="btn btn-outline-danger"
                type="button"
                onClick={clearCart}
                >
                清空購物車
                </button>
            </div>
            <table className="table align-middle">
                <thead>
                <tr>
                    <th></th>
                    <th>品名</th>
                    <th>數量/單位</th>
                    <th>單價</th>
                </tr>
                </thead>
                <tbody>
                {cart.carts?.map((cartItem) => (
                    <tr key={cartItem.id}>
                        <td>
                        <button
                            type="button"
                            className="btn btn-outline-danger btn-sm"
                            onClick={()=> deleteCartItem(cartItem.id) }
                        >
                            <i className="bi bi-x" /> 刪除
                        </button>
                        </td>
                        <td>
                        {cartItem.product.title}
                        </td>
                        <td>
                        <div className="input-group input-group-sm">
                            <input
                            type="number"
                            className="form-control"
                            min="1"
                            value={cartItem.qty}
                            onChange={(e)=> updateCartItem(cartItem.id, cartItem.product_id, e.target.value)}
                            />
                            <div className="input-group-text">/{cartItem.product.unit}</div>
                        </div>
                        </td>
                        <td className="text-end">
                        {cartItem.final_total !== cartItem.total && (
                            <small className="text-success">折扣價：</small>
                        )}
                        {cartItem.final_total}
                        </td>
                    </tr>
                    ))}
                </tbody>
                <tfoot>
                <tr>
                    <td colSpan="3" className="text-end">
                    總計
                    </td>
                    <td className="text-end">{cart?.total}</td>
                </tr>
                {cart?.final_total !== cart?.total ? (
                    <tr>
                    <td colSpan="3" className="text-end text-success">
                        折扣價
                    </td>
                    <td className="text-end text-success">
                        {cart?.final_total}
                    </td>
                    </tr>
                ) : (
                    ""
                )}
                </tfoot>
            </table>
        </div>)}

        {/* 表單資料 */}
        <div className="my-5 row justify-content-center">
            <form onSubmit={onSubmit} className="col-md-6">
            <div className="mb-3">
                <label htmlFor="name" className="form-label">
                收件人姓名
                </label>
                <input
                 {...register('name', {required:'收件人為必填資訊'})}
                id="name"
                type="text"
                className={`form-control ${errors.name && 'is-invalid'}`}
                placeholder="請輸入姓名"
                />
                 {errors.name && <p className='text-danger my-2'>{errors.name.message}</p>}
            </div>

            <div className="mb-3">
                <label htmlFor="email" className="form-label">
                Email
                </label>
                <input
                {...register('email', { required:'Email為必填資訊', pattern: { value:/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, message:'Email格式錯誤' }})}
                id="email"
                type="email"
                className={`form-control ${errors.email && 'is-invalid'}`}
                placeholder="請輸入 Email"
                />
                {errors.email && <p className='text-danger my-2'>{errors.email.message}</p>}
            </div>

            <div className="mb-3">
                <label htmlFor="tel" className="form-label">
                收件人電話
                </label>
                <input
                {...register('tel', { required:'電話為必填資訊', pattern: { value:/^(0[2-8]\d{7}|09\d{8})$/, message:'電話格式錯誤' }})}
                id="tel"
                type="tel"
                className={`form-control ${errors.tel && 'is-invalid'}`}
                placeholder="請輸入電話"
                />
                {errors.tel && <p className='text-danger my-2'>{errors.tel.message}</p>}
            </div>

            <div className="mb-3">
                <label htmlFor="address" className="form-label">
                收件人地址
                </label>
                <input
                {...register('address', { required:'地址為必填資訊'})}
                id="address"
                type="text"
                className={`form-control ${errors.address && 'is-invalid'}`}
                placeholder="請輸入地址"
                />
                {errors.address && <p className='text-danger my-2'>{errors.address.message}</p>}
            </div>

            <div className="mb-3">
                <label htmlFor="message" className="form-label">
                留言
                </label>
                <textarea
                {...register('message')}
                id="message"
                className="form-control"
                placeholder="留言"
                rows="3"
                />
            </div>

            <div className="text-end">
                <button type="submit" className="btn btn-danger">
                送出訂單
                </button>
            </div>
            </form>
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

    </div>
    </>)
}

export default ClientPage;