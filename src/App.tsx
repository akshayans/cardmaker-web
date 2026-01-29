import { BsHeartFill } from 'react-icons/bs'
import { useNavigate } from 'react-router-dom'
import "./App.css"

function App() {
  const navigate = useNavigate()

  return (
      <>
      <div className="text-center space-y-8 px-4">
        <div className="space-y-4">
          <img src="/logo.png" alt="logo" className="w-128 h-auto" />
          <p className="text-xl text-black opacity-80">create cards for people, then share them.</p>
        </div>
        
        <div className="flex flex-col gap-4 sm:flex-row justify-center">
          <button 
            className="btn btn-primary btn-lg text-white"
            onClick={() => navigate('/create')}
          >
            create
          </button>
        </div>
      </div>
      
      <div className="fixed bottom-0 left-0 w-full text-xl flex justify-center text-center p-4 bg-base-200 text-black">
        made with 
        <span>
          <BsHeartFill size={20} className="ms-2 me-2 mt-1 mb-1 text-red-500" />
        </span> 
        by  
        <a 
          href="https://github.com/akshayans" 
          className="ms-2 me-2 mb-2 mt font-shrikhand text-white visited:text-white text-outline-white no-underline" 
          style={{ textShadow: '0 0 10px red, 0 0 20px darkred' }}
        >
          akshayan
        </a> 
      </div>
      </>
  )
}

export default App
