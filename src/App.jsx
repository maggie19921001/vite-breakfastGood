import { useState } from 'react'
import LoginPage from './pages/LoginPage';
import ProductPage from './pages/ProductPage';

function App() {
  const [authStatus, setAuthStatus] = useState(false);

  return (
  <>
  {authStatus?<ProductPage />:
  <LoginPage  setAuthStatus={setAuthStatus} />}
  </> 
  )
}

export default App
