import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { Modal } from 'bootstrap';
import { useDispatch } from 'react-redux'
import { pushMessage } from '../redux/toastSlice'
import PropTypes from 'prop-types'

const { VITE_APP_PATH } = import.meta.env;
const { VITE_APP_API } = import.meta.env;

function ProductModal ({modalMode, assignProduct, isOpen, setIsOpen, getProduct}){
    ProductModal.propTypes = {
        modalMode: PropTypes.oneOf(['create', 'edit']),
        assignProduct: PropTypes.shape({
          imageUrl: PropTypes.string,
          title: PropTypes.string,
          category: PropTypes.string,
          unit: PropTypes.string,
          origin_price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
          price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
          description: PropTypes.string,
          content: PropTypes.string,
          is_enabled: PropTypes.oneOfType([PropTypes.bool, PropTypes.number]),
          imagesUrl: PropTypes.arrayOf(PropTypes.string)
        }),
        isOpen: PropTypes.bool.isRequired,
        setIsOpen: PropTypes.func.isRequired,
        getProduct: PropTypes.func.isRequired
      }
    const dispatch = useDispatch();
    const [modalData, setModalData] = useState(assignProduct);
    const productModalRef = useRef(null);
    //NOTE new Modal(DOM元素) 建立實體
    //NOTE Modal.getInstance(DOM元素) 取得實體

    //將assignProduct複製過來才能使用
    useEffect(() => {
    	setModalData({ ...assignProduct });
    }, [assignProduct]);

    // Modal Create & Functions
    useEffect(() => {
        new Modal(productModalRef.current, {backdrop: false}); 
    },[]);

    useEffect(() => {
        if(isOpen){
            const productModal = Modal.getInstance(productModalRef.current);
            productModal.show();
        }
    },[isOpen])

    const closeProductModal = () => {
        const productModal = Modal.getInstance(productModalRef.current);
        productModal.hide();
        setIsOpen(false);
    }

    const modalInputChange = (event) => {
        const{ name, value ,checked ,type} = event.target;
        setModalData({
        ...modalData,
        [name]: type === "checkbox" ? checked : value
        })
    }

    const imageChange = (event, index) => {
        const { value } = event.target;
        const Images = [...modalData.imagesUrl];
        Images[index] = value; //將使用者輸入的值（value）更新到拷貝陣列 Images 的指定索引（index）中
        setModalData({
        ...modalData,
        imagesUrl: Images
        })
    }

    const addImage = () => {
        const Images = [...modalData.imagesUrl, ''];
        setModalData({
        ...modalData,
        imagesUrl: Images
        })
    }

    const removeImage = () => {
        const Images = [...modalData.imagesUrl];
        Images.pop();
        setModalData({
        ...modalData,
        imagesUrl: Images
        })
    }

    const createProduct = async() => {
        const requiredInput = {title:'標題', category:'分類', price:'售價'};
        const missingFields = Object.keys(requiredInput).filter(field => !modalData[field]);

        if (missingFields.length > 0) {
            const missingFieldNames = missingFields.map(field => requiredInput[field]).join(', ');
            alert(`請填寫以下欄位: ${missingFieldNames}`);
            return;
        }

        try{
        const res = await axios.post(`${VITE_APP_PATH}/v2/api/${VITE_APP_API}/admin/product`,
        {
            data:{
                ...modalData,
                origin_price: Number(modalData.origin_price),
                price: Number(modalData.price),
                is_enabled: modalData.checked ? 1 : 0
            } 
        })
        dispatch(pushMessage({
            text: res.data.message,
            status: 'success'
        }))
        return res;

        }catch(error){
        console.log('error in create product', error);
    
        const{ message } = error.response.data;
        dispatch(pushMessage({
            text: message.join('、'),
            status: 'failed'
        }))
        
        }
    }

    const editProduct = async() => {
        try{
        const res = await axios.put(`${VITE_APP_PATH}/v2/api/${VITE_APP_API}/admin/product/${modalData.id}`,
        {
            data:{
                ...modalData,
                origin_price: Number(modalData.origin_price),
                price: Number(modalData.price),
                is_enabled: modalData.is_enabled ? 1 : 0
            } 
        })
        dispatch(pushMessage({
            text: res.data.message,
            status: 'success'
        }))
        
        }catch(error){
        dispatch(pushMessage({
            text: error.response.data.join('、'),
            status: 'failed'
        }))
        }
    }

    const updateProducts = async() => {
        const apiCall = modalMode === 'create' ? createProduct : editProduct;
        
        try{
        // apiCall指向為函式，可呼叫三元運算結果函式
        const apiRes = await apiCall();
        if(apiRes.data.success === true){
            getProduct();
            closeProductModal();
        }
        console.log(apiRes);
        }catch(error){
        dispatch(pushMessage({
            text: error.response.data.join('、'),
            status: 'failed'
        }))
        }
    }

    const fileUpload = async(event) => {
        const file = event.target.files[0];
        const uploadData = new FormData();
        uploadData.append('file-to-upload', file);
        
        //NOTE FormData是一種特殊的物件，不能像普通物件一樣透過 console.log 檢查內容
        //way1
        // console.log("File from FormData: ", uploadData.get('file-to-upload'));
        //way2
        // for (let [key, value] of uploadData.entries()) {
        //   console.log(`${key}:`, value);
        // }

        try{
        const uploadImgRes = await axios.post(`${VITE_APP_PATH}/v2/api/${VITE_APP_API}/admin/upload`, uploadData);
        const uploadImage = uploadImgRes.data.imageUrl;
        setModalData({
            ...modalData,
            imageUrl: uploadImage
        })
        }catch(error){
        dispatch(pushMessage({
            text: '圖片上傳失敗',
            status: 'failed'
        }))
        console.log('error in upload image', error);
        }

    }

    return(<>
        <div ref={ productModalRef } 
            id="productModal" className="modal" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog modal-dialog-centered modal-xl">
                <div className="modal-content border-0 shadow">
                <div className="modal-header border-bottom">
                    <h5 className="modal-title fs-4">{modalMode === 'create' ? '新增產品' : '編輯產品'}</h5>
                    <button onClick={closeProductModal} type="button" className="btn-close" aria-label="Close"></button>
                </div>

                <div className="modal-body p-4">
                    <div className="row g-4">
                    <div className="col-md-4">
                        <div className="mb-4">
                        <div className="my-3">
                            <label htmlFor="fileInput" className="form-label"> 圖片上傳 </label>
                            <input
                            onChange={fileUpload}
                            type="file"
                            accept=".jpg,.jpeg,.png"
                            className="form-control"
                            id="fileInput"
                            />
                            <span className='text-body-secondary'><small>僅限使用 jpg、jpeg 與 png 格式<br></br>檔案大小限制為 3MB 以下</small></span>
                        </div>
                        <label htmlFor="primary-image" className="form-label">
                            主圖
                        </label>
                        <div className="input-group mb-3">
                            <input
                            name="imageUrl"
                            type="text"
                            id="primary-image"
                            className="form-control"
                            placeholder="或輸入圖片連結"
                            value={modalData.imageUrl}
                            onChange={modalInputChange}
                            />
                        </div>
                        <img
                            src={modalData.imageUrl}
                            alt={modalData.title}
                            className="img-fluid"
                        />
                        </div>

                        {/* 副圖 */}
                        <div className="border border-2 border-dashed rounded-3 p-3">
                        {modalData.imagesUrl?.map((image, index) => (
                            <div key={index} className="mb-2">
                            <label
                                htmlFor={`imagesUrl-${index + 1}`}
                                className="form-label"
                            >
                                副圖 {index + 1}
                            </label>
                            <input
                                id={`imagesUrl-${index + 1}`}
                                type="text"
                                placeholder={`圖片網址 ${index + 1}`}
                                className="form-control mb-2"
                                value={image}
                                onChange={(event)=>imageChange(event, index)}
                            />
                            {image && (
                                <img
                                src={image}
                                alt={`副圖 ${index + 1}`}
                                className="img-fluid mb-2"
                                />
                            )}
                            </div>
                        ))}
                        <div className="btn-group w-100">
                        {/*未達上限且最後一個欄位有值時顯示*/}
                        {modalData.imagesUrl.length < 5 && modalData.imagesUrl[modalData.imagesUrl.length - 1] !== '' && (
                            <button onClick={addImage} className="btn btn-outline-primary btn-sm w-100">新增圖片</button>)}
                        {/*當多圖陣列有值且非唯一的欄位就顯示*/}
                        {modalData.imagesUrl.length > 1 && (
                        <button onClick={removeImage} className="btn btn-outline-danger btn-sm w-100">刪除圖片</button>)}
                        </div>
                        </div>
                    </div>

                    <div className="col-md-8">
                        <div className="mb-3">
                        <label htmlFor="title" className="form-label">
                            標題
                        </label>
                        <input
                            name="title"
                            id="title"
                            type="text"
                            className="form-control"
                            placeholder="請輸入標題"
                            value={modalData.title}
                            onChange={modalInputChange}
                        />
                        </div>

                        <div className="mb-3">
                        <label htmlFor="category" className="form-label">
                            分類
                        </label>
                        <input
                            name="category"
                            id="category"
                            type="text"
                            className="form-control"
                            placeholder="請輸入分類"
                            value={modalData.category}
                            onChange={modalInputChange}
                        />
                        </div>

                        <div className="mb-3">
                        <label htmlFor="unit" className="form-label">
                            單位
                        </label>
                        <input
                            name="unit"
                            id="unit"
                            type="text"
                            className="form-control"
                            placeholder="請輸入單位"
                            value={modalData.unit}
                            onChange={modalInputChange}
                        />
                        </div>

                        <div className="row g-3 mb-3">
                        <div className="col-6">
                            <label htmlFor="origin_price" className="form-label">
                            原價
                            </label>
                            <input
                            name="origin_price"
                            id="origin_price"
                            type="number"
                            className="form-control"
                            placeholder="請輸入原價"
                            value={modalData.origin_price}
                            onChange={modalInputChange}
                            min="0"
                            />
                        </div>
                        <div className="col-6">
                            <label htmlFor="price" className="form-label">
                            售價
                            </label>
                            <input
                            name="price"
                            id="price"
                            type="number"
                            className="form-control"
                            placeholder="請輸入售價"
                            value={modalData.price}
                            onChange={modalInputChange}
                            min="0"
                            />
                        </div>
                        </div>

                        <div className="mb-3">
                        <label htmlFor="description" className="form-label">
                            產品描述
                        </label>
                        <textarea
                            name="description"
                            id="description"
                            className="form-control"
                            rows={4}
                            placeholder="請輸入產品描述"
                            value={modalData.description}
                            onChange={modalInputChange}
                        ></textarea>
                        </div>

                        <div className="mb-3">
                        <label htmlFor="content" className="form-label">
                            說明內容
                        </label>
                        <textarea
                            name="content"
                            id="content"
                            className="form-control"
                            rows={4}
                            placeholder="請輸入說明內容"
                            value={modalData.content}
                            onChange={modalInputChange}
                        ></textarea>
                        </div>

                        <div className="form-check">
                        <input
                            name="is_enabled"
                            type="checkbox"
                            className="form-check-input"
                            id="isEnabled"
                            checked={modalData.is_enabled}
                            onChange={modalInputChange}
                        />
                        <label className="form-check-label" htmlFor="isEnabled">
                            是否啟用
                        </label>
                        </div>
                    </div>
                    </div>
                </div>

                <div className="modal-footer border-top bg-light">
                    <button onClick={closeProductModal} type="button" className="btn btn-secondary">
                    取消
                    </button>
                    <button onClick={updateProducts} type="button" className="btn btn-primary">
                    確認
                    </button>
                </div>
                </div>
            </div>
        </div>


    </>)

}

export default ProductModal;