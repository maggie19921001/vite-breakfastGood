import { useEffect, useRef } from 'react'
import axios from 'axios'
import { Modal } from 'bootstrap';

const { VITE_APP_PATH } = import.meta.env;
const { VITE_APP_API } = import.meta.env;

function DeleteModal({assignProduct, isOpen, setIsOpen, getProduct}){

    const deleteProductModalRef = useRef(null);  
    useEffect(() => {
        new Modal(deleteProductModalRef.current, {backdrop: false}); 
    },[]);

    useEffect(() => {
        if(isOpen){
            const productModal = Modal.getInstance(deleteProductModalRef.current);
            productModal.show();
        }
    },[isOpen])

    const deleteProduct = async() => {
        try{
        const res = await axios.delete(`${VITE_APP_PATH}/v2/api/${VITE_APP_API}/admin/product/${assignProduct.id}`,
        {
            data:{
                ...assignProduct,
                origin_price: Number(assignProduct.origin_price),
                price: Number(assignProduct.price),
                is_enabled: assignProduct.checked ? 1 : 0
            } 
        })
        alert(res.data.message);
        getProduct();
        closeDeleteProductModal();
        }catch(error){
        console.log('error in delete product', error);
        alert('刪除產品失敗')
        }
    }

    const closeDeleteProductModal = () => {
        const productModal = Modal.getInstance(deleteProductModalRef.current);
        productModal.hide();
        setIsOpen(false);
    }

    return(
        <div ref={ deleteProductModalRef }
            className="modal fade"
            id="delProductModal"
            tabIndex="-1"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
            >
            <div className="modal-dialog">
                <div className="modal-content">
                <div className="modal-header">
                    <h1 className="modal-title fs-5">刪除產品</h1>
                    <button
                    onClick={closeDeleteProductModal}
                    type="button"
                    className="btn-close"
                    data-bs-dismiss="modal"
                    aria-label="Close"
                    ></button>
                </div>
                <div className="modal-body">
                    你是否要刪除 
                    <span className="text-danger fw-bold">{assignProduct.title}</span>
                </div>
                <div className="modal-footer">
                    <button
                    onClick={closeDeleteProductModal}
                    type="button"
                    className="btn btn-secondary"
                    >
                    取消
                    </button>
                    <button onClick={deleteProduct} type="button" className="btn btn-danger">
                    刪除
                    </button>
                </div>
                </div>
            </div>
        </div>
    );
}

export default DeleteModal;