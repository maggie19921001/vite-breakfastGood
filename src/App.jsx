import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { Modal } from 'bootstrap';

import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
// import './App.css'

const { VITE_APP_PATH } = import.meta.env;
const { VITE_APP_API } = import.meta.env;

// Data 放外層
const defaultModalState = {
  imageUrl: "",
  title: "",
  category: "",
  unit: "",
  origin_price: "",
  price: "",
  description: "",
  content: "",
  is_enabled: 0,
  imagesUrl: [""]
};

function App() {

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [authStatus, setAuthStatus] = useState(false);
  const [products, setProducts] = useState([]);
  const productModalRef = useRef(null);
  const deleteProductModalRef = useRef(null);

  const [assignProduct, setAssignProduct] = useState(defaultModalState);
  const [modalMode, setModalMode] = useState(null);
  //NOTE new Modal(DOM元素) 建立實體
  //NOTE Modal.getInstance(DOM元素) 取得實體

  // Modal Create & Functions
  useEffect(() => {
    new Modal(productModalRef.current, {backdrop: false}); 
    new Modal(deleteProductModalRef.current, {backdrop: false}); 
  },[]);

  //NOTE 如需傳入參數需要使用箭頭函式 onClick={()=>openProductModal('create')}
  const openProductModal = (mode, product) => {
    setModalMode(mode);
    switch (mode){
      case 'create':
        setAssignProduct(defaultModalState);
        break;
      case 'edit':
        setAssignProduct(product);
        break;
    }
    const productModal = Modal.getInstance(productModalRef.current); 
    productModal.show();
  }

  const closeProductModal = () => {
    const productModal = Modal.getInstance(productModalRef.current);
    productModal.hide();
  }

  const modalInputChange = (event) => {
    const{ name, value ,checked ,type} = event.target;
    setAssignProduct({
      ...assignProduct,
      [name]: type === "checkbox" ? checked : value
    })
  }

  const imageChange = (event, index) => {
    const { value } = event.target;
    const Images = [...assignProduct.imagesUrl];
    Images[index] = value; //將使用者輸入的值（value）更新到拷貝陣列 Images 的指定索引（index）中
    setAssignProduct({
      ...assignProduct,
      imagesUrl: Images
    })
  }

  const addImage = () => {
    const Images = [...assignProduct.imagesUrl, ''];
    setAssignProduct({
      ...assignProduct,
      imagesUrl: Images
    })
  }

  const removeImage = () => {
    const Images = [...assignProduct.imagesUrl];
    Images.pop();
    setAssignProduct({
      ...assignProduct,
      imagesUrl: Images
    })
  }

  const createProduct = async() => {
    try{
      const res = await axios.post(`${VITE_APP_PATH}/v2/api/${VITE_APP_API}/admin/product`,
      {
          data:{
            ...assignProduct,
            origin_price: Number(assignProduct.origin_price),
            price: Number(assignProduct.price),
            is_enabled: assignProduct.checked ? 1 : 0
          } 
      })
    }catch(error){
      console.log('error in create product', error);
      alert('新增產品失敗')
    }
  }

  const editProduct = async() => {
    try{
      const res = await axios.put(`${VITE_APP_PATH}/v2/api/${VITE_APP_API}/admin/product/${assignProduct.id}`,
      {
          data:{
            ...assignProduct,
            origin_price: Number(assignProduct.origin_price),
            price: Number(assignProduct.price),
            is_enabled: assignProduct.is_enabled ? 1 : 0
          } 
      })
      alert(res.data.message);
    }catch(error){
      console.log('error in edit product', error);
      alert('編輯產品失敗')
    }
  }

  const updateProducts = async() => {
    const apiCall = modalMode === 'create' ? createProduct : editProduct;
    
    try{
      // apiCall指向為函式，可呼叫三元運算結果函式
      await apiCall();

      getProduct();
      closeProductModal();
    }catch(error){
      console.log('error in update products', error);
      alert('新增產品失敗');
    }
  }

  const openDeleteProductModal = (product) => {
    setAssignProduct(product)
    const productModal = Modal.getInstance(deleteProductModalRef.current);
    productModal.show();
  }
  const closeDeleteProductModal = () => {
    const productModal = Modal.getInstance(deleteProductModalRef.current);
    productModal.hide();
  }

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

// Auto Check Token for AuthStatus
  useEffect(() => {
          const token = document.cookie
          .split("; ")
          .find((row) => row.startsWith("YHtoken="))
          ?.split("=")[1];
          if(token){
            axios.defaults.headers.common.Authorization = `${token}`;
            checkLogin();
            getProduct();
          }
  }, []);

// Login & Get Products 
  const formInputChange = (e) => {
      const { name, value } = e.target;
      setFormData({
          ...formData,
          [name]: value,
      });
  };
  const loginSubmit = async (e) => {
      e.preventDefault();
      try {
          const logRes = await axios.post(
              `${VITE_APP_PATH}/v2/admin/signin`,
              {
                  username: formData.email,
                  password: formData.password,
              }
          );
          const { token,expired } = logRes.data; 

          // 儲存 token
          document.cookie = `YHtoken=${token}; expires=${new Date(expired).toUTCString()};path=/;secure; SameSite=Strict`;
          //將token存入axios中header代入預設值（每次發送都會使用此值）
          axios.defaults.headers.common.Authorization = `${token}`;

          getProduct();
          setAuthStatus(true);
          alert("登入成功！");
          setFormData({ email: "", password: "" });

      } catch (error) {
          console.error("error in login submit:", error.response.data.message);
          alert("登入失敗，請檢查帳號密碼。");
      }
  };
  const getProduct = async() => {
    try{
      const getPdRes = await axios.get(`${VITE_APP_PATH}/v2/api/${VITE_APP_API}/admin/products`);
      console.log('all products',getPdRes);
      setProducts(getPdRes.data.products);

    } catch(error){
      console.log('error in get product',error);
    }
  }
// Check Login Status
  const checkLogin = async() => {
    try{
      const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("YHtoken="))
      ?.split("=")[1];

      // // 如無存default header的寫法
      // const config = {
      //   headers: { Authorization: token },
      // };
      // const checkRes = await axios.post(`${VITE_APP_PATH}/v2/api/user/check`, {}, config)
      if(token){
        const checkRes = await axios.post(`${VITE_APP_PATH}/v2/api/user/check`)
        alert('已登入');
        setAuthStatus(true);
        console.log('checkRes',checkRes);
      }else{
        alert('未登入或登入狀態有誤');
        setAuthStatus(false);
      }

    }catch(error){
      console.log(error.response.data);
      alert('未登入或登入狀態有誤');
      setAutnStatus(false);
    }
  }

  //NOTE _products.map 後方使用圓括弧！如使用{}則需加上return!

  return (
  <>
  {authStatus?(
    <>
    <nav className="navbar bg-warning mb-5 px-2">
      <div className="container-fluid">
        <a className="navbar-brand mb-0 h1">Dashboard</a>
          <button onClick={()=>openProductModal('create')} className="btn btn-outline-dark" type="button">
            新增產品
          </button>
      </div>
    </nav>
    <div className="productPage container d-flex flex-column">
      <div className="row">
        <div className="col">
          <p className='display-6 text-start'>產品列表</p>
          <table className="table table-hover">
            <thead className='table-dark'>
              <tr>
                <th scope="col">產品名稱</th>
                <th scope="col">原價</th>
                <th scope="col">售價</th>
                <th scope="col">是否啟用</th>
                <th scope="col">查看細節</th>
              </tr>
            </thead>
            <tbody>
            {products?(
              products.map((product) => (
                <tr key={product.id}>
                  <td>{product.title}</td>
                  <td>{product.origin_price}</td>
                  <td>{product.price}</td>
                  <td>{product.is_enabled === 1 ? "啟用" : "未啟用"}</td>
                  <td>
                    <div className="btn-group">
                      <button onClick={()=>openProductModal('edit', product)} type="button" className="btn btn-outline-primary btn-sm">編輯</button>
                      <button onClick={()=>openDeleteProductModal(product)} type="button" className="btn btn-outline-danger btn-sm">刪除</button>
                    </div>
                  </td>
                </tr>
              ))

            ):(

            <tr>
              <td colSpan="5">尚無產品資料</td>
            </tr>

            )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </>
  ):(
    <div className="loginPage row justify-content-center p-5">
      <form className="col-4" onSubmit={loginSubmit}>
        <div className="mb-3">
          <label className="form-label d-block text-start">Email address</label>
            <input
              type="email"
              name="email"
              className="form-control"
              value={formData.email}
              onChange={formInputChange}
              required
              />
        </div>
        <div className="mb-3">
          <label className="form-label d-block text-start">Password</label>
          <input
              type="password"
              name="password"
              className="form-control"
              value={formData.password}
              onChange={formInputChange}
              required
          />
        </div>
        <div className="d-flex gap-3 justify-content-center">
          <button type="submit" className="btn btn-primary px-3">
              Login
          </button>
        </div>
      </form>
    </div>
  )}

    <div ref={ productModalRef } id="productModal" className="modal" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
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
                  <label htmlFor="primary-image" className="form-label">
                    主圖
                  </label>
                  <div className="input-group">
                    <input
                      name="imageUrl"
                      type="text"
                      id="primary-image"
                      className="form-control"
                      placeholder="請輸入圖片連結"
                      value={assignProduct.imageUr}
                      onChange={modalInputChange}
                    />
                  </div>
                  <img
                    src={assignProduct.imageUrl}
                    alt={assignProduct.title}
                    className="img-fluid"
                  />
                </div>

                {/* 副圖 */}
                <div className="border border-2 border-dashed rounded-3 p-3">
                  {assignProduct.imagesUrl?.map((image, index) => (
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
                  {assignProduct.imagesUrl.length < 5 && assignProduct.imagesUrl[assignProduct.imagesUrl.length - 1] !== '' && (
                    <button onClick={addImage} className="btn btn-outline-primary btn-sm w-100">新增圖片</button>)}
                  {/*當多圖陣列有值且非唯一的欄位就顯示*/}
                  {assignProduct.imagesUrl.length > 1 && (
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
                    value={assignProduct.title}
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
                    value={assignProduct.category}
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
                    value={assignProduct.unit}
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
                      value={assignProduct.origin_price}
                      onChange={modalInputChange}
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
                      value={assignProduct.price}
                      onChange={modalInputChange}
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
                    value={assignProduct.description}
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
                    value={assignProduct.content}
                    onChange={modalInputChange}
                  ></textarea>
                </div>

                <div className="form-check">
                  <input
                    name="is_enabled"
                    type="checkbox"
                    className="form-check-input"
                    id="isEnabled"
                    checked={assignProduct.is_enabled}
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

    <div
      ref={ deleteProductModalRef }
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
  </> 
  )
}

export default App
