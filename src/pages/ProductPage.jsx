import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { Modal } from 'bootstrap';
import Pagination from '../components/Pagination';
import ProductModal from '../components/ProductModal';
import DeleteModal from '../components/DeleteModal';

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

function ProductPage (){
    const [products, setProducts] = useState([]);
    const [assignProduct, setAssignProduct] = useState(defaultModalState);
    const [pageInfo,setPageInfo] = useState({});


    const getProduct = async(page = 1) => {
      try{
        const getPdRes = await axios.get(`${VITE_APP_PATH}/v2/api/${VITE_APP_API}/admin/products?page=${page}`);
        console.log('all products',getPdRes);
        setProducts(getPdRes.data.products);
        setPageInfo(getPdRes.data.pagination);
  
      } catch(error){
        console.log('error in get product',error);
      }
    }

    useEffect(() => {
        getProduct();
    },[])

    const pageChange = (page) => {
        getProduct(page);
        }

    const [modalMode, setModalMode] = useState(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

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
        // const productModal = Modal.getInstance(productModalRef.current); 
        // productModal.show();
        setIsModalOpen(true);
    }

    const openDeleteProductModal = (product) => {
        setAssignProduct(product)
        // const productModal = Modal.getInstance(deleteProductModalRef.current);
        // productModal.show();
        setIsDeleteModalOpen(true);
    }
   
return(
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
        <Pagination pageInfo={pageInfo} pageChange={pageChange}/>
    </div>
        <ProductModal 
        modalMode={modalMode} 
        assignProduct={assignProduct} 
        isOpen={isModalOpen} 
        setIsOpen={setIsModalOpen}
        getProduct={getProduct}/>

        <DeleteModal
        assignProduct={assignProduct} 
        isOpen={isDeleteModalOpen} 
        setIsOpen={setIsDeleteModalOpen}
        getProduct={getProduct}
        />

    </>
)
}

export default ProductPage;