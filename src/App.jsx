import { useEffect, useState } from 'react'
import axios from 'axios'

import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

const { VITE_APP_PATH } = import.meta.env;
const { VITE_APP_API } = import.meta.env;

function App() {

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [authStatus, setAuthStatus] = useState(false);
  const [products, setProducts] = useState([]);
  const [assignProduct, setAssignProduct] = useState(null);

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
      // const token = document.cookie
      // .split("; ")
      // .find((row) => row.startsWith("YHtoken="))
      // ?.split("=")[1];

      // // 如無存default header的寫法
      // const config = {
      //   headers: { Authorization: token },
      // };
      // const checkRes = await axios.post(`${VITE_APP_PATH}/v2/api/user/check`, {}, config)

      const checkRes = await axios.post(`${VITE_APP_PATH}/v2/api/user/check`)
      console.log('checkRes',checkRes);
      alert('已登入');
      setAuthStatus(true);

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
    <div className="productPage container d-flex flex-column">
      <button
        className="btn btn-outline-warning mb-5"
        type="button"
        id="check"
        onClick={checkLogin}
      >
        確認是否登入
      </button>
      <div className="row">
        <div className="col">
          <p className='display-6 text-start'>產品列表</p>
          <table className="table table-hover">
            <thead>
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
              products.map((item) => (
                <tr key={item.id}>
                  <td>{item.title}</td>
                  <td>{item.origin_price}</td>
                  <td>{item.price}</td>
                  <td>{item.is_enabled === 1 ? "啟用" : "未啟用"}</td>
                  <td>
                    <button
                      className="btn btn-primary"
                      onClick={() => setAssignProduct(item)}
                    >
                      查看細節
                    </button>
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
        <div className="col">
          <p className='display-6 text-start'>產品資訊</p>
          {assignProduct?(
            <div className="card mb-3">
                  <div className="card-body text-start">
                  <img src={assignProduct.imageUrl} 
                  className="img-fluid card-img-top mb-2" 
                  alt="主圖"/>
                    <h5 className="card-title">{assignProduct.title}</h5>
                    <p className="card-text"><small className="text-body-secondary">類別：{assignProduct.category}</small></p>
                    <p className="card-text">內容：{assignProduct.content}</p>
                    <div className="d-flex align-items-center gap-2">
                        售價：
                      <small className="card-text text-secondary">
                        <del>{assignProduct.origin_price}元</del>
                      </small>
                         <span className='text-danger fw-bold'> {assignProduct.price} 元</span>
                    </div>
                    {assignProduct.imagesUrl?.map((url, index) => (
                        <img
                          key={index}
                          src={url}
                          className="images card-img-bottom"
                          alt="副圖"
                        />
                      ))}
                  </div>
            </div>
          ):(
            <p className="text-secondary">請選擇一個商品查看</p>
          )}
        </div>
      </div>
    </div>
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
  </> 
  )
}

export default App
