import { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from "react-router-dom";
const { VITE_APP_PATH } = import.meta.env;
function LoginPage (){
    
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: "", password: "" });

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
            document.cookie = `YHtoken=${token}; expires=${new Date(expired).toUTCString()};path=/; secure; SameSite=Strict`;
            //將token存入axios中header代入預設值（每次發送都會使用此值）
            axios.defaults.headers.common.Authorization = `${token}`;

            // getProduct();
            alert("登入成功！");
            setFormData({ email: "", password: "" });
            navigate("/dashboard");  
        } catch (error) {
            console.error("error in login submit:", error.response.data.message);
            alert("登入失敗，請檢查帳號密碼。");
        }
    };

    // Auto Check Token for AuthStatus
    useEffect(() => {
            const token = document.cookie
            .split("; ")
            .find((row) => row.startsWith("YHtoken="))
            ?.split("=")[1];
            if(token){
            axios.defaults.headers.common.Authorization = `${token}`;
            checkLogin();
            }
    }, []);
    
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
            navigate("/dashboard");  
            console.log('checkRes',checkRes);
            }else{
            alert('未登入或登入狀態有誤');
            }

        }catch(error){
            console.log(error.response.data);
            alert('未登入或登入狀態有誤');
        }
    }  

return (
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
)
}

export default LoginPage;