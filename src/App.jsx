import { useState } from 'react'
import LoginPage from './pages/LoginPage';
import ProductPage from './pages/ProductPage';
import ClientPage from './pages/ClientPage';

function App() {
  const [authStatus, setAuthStatus] = useState(false);

  return (
  <>
  <ClientPage/>
  {/* {authStatus?<ProductPage />:
  <LoginPage  setAuthStatus={setAuthStatus} />} */}
  </> 
  )
}

export default App
