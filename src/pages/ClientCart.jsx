import { useEffect, useState } from 'react'
import axios from 'axios'
import ReactLoading from "react-loading";
import { useForm } from 'react-hook-form';

const { VITE_APP_PATH } = import.meta.env;
const { VITE_APP_API } = import.meta.env;


export default function ClientCart(){
    const [cart, setCart] = useState({});
    const [isScreenLoading, setIsScreenLoading] = useState(false);

    useEffect(() => {
        getCart();
    },[])

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
    return(
        <>
        <div className="container mt-3">
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
        </>
    )
}