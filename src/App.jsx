import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/home';
import Work from './pages/Work'; // <-- 1. THIS IMPORT IS CRITICAL

function App() {
  return (
    <Router>
      <div className="font-sans min-h-screen bg-black text-white relative">
        
        {/* Transparent Floating Navigation Bar */}
        <nav className="absolute top-0 left-0 w-full flex justify-between items-center p-6 md:px-12 z-50 bg-transparent">
          <Link to="/" className="hover:opacity-75 transition-opacity">
            <img src="/logo.png" alt="Camera Boy Logo" className="h-16 w-auto drop-shadow-lg" />
          </Link>
          <div className="flex gap-8 items-center text-sm tracking-widest uppercase font-semibold">
            <Link to="/work" className="text-gray-200 hover:text-white transition-colors drop-shadow-md">Work</Link>
            <Link to="/rates" className="text-gray-200 hover:text-white transition-colors drop-shadow-md">Inquiries</Link>
          </div>
        </nav>

        {/* Page Routing */}
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            
            {/* <-- 2. THIS ROUTE NOW POINTS TO YOUR NEW GRID --> */}
            <Route path="/work" element={<Work />} /> 
            
            <Route path="/rates" element={
              <div className="pt-32 p-10 text-center">
                <h1 className="text-3xl font-bold">Pricing & Contact coming soon...</h1>
              </div>
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;