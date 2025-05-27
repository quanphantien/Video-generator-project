import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import Navbar from "./components/NavBar/NavBar";
import Trending from "./components/Trending/Trending";
import Footer from "./components/Footer/Footer";
import ScriptGen from "./components/ScriptGen/ScriptGen";

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-grow">
          <Routes>
            <Route path="/" element={<Trending />} />
            <Route path="/ScriptGen" element={<ScriptGen />} />
            {/* Sau này bạn có thể thêm route khác ở đây */}
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;

