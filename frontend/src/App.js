// import React from "react";
// import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

// import Homepage from "./components/a1_Homepage/Homepage";
// import Navbar from "./components/a2_NavBar/NavBar";
// import Footer from "./components/a3_Footer/Footer";

// import Trending from "./components/b1_Trending/Trending";
// import ScriptGen from "./components/b2_ScriptGen/ScriptGen";
// import VoiceGen from "./components/b3_VoiceGen/VoiceGen";

// import VideoCreator from "./components/b0_VideoCreator/VideoCreator";

// function App() {
//   return (
//     <Router>
//       <div className="flex flex-col min-h-screen">
//         <Navbar />
//         <div className="flex-grow">
//           <Routes>
//             <Route path="/" element={<Homepage />} />
//             <Route path="/Trending" element={<Trending />} />
//             <Route path="/ScriptGen" element={<ScriptGen />} />
//             <Route path="/VoiceGen" element={<VoiceGen />} />
//             {/* Bạn có thể thêm các route khác ở đây */}
//           </Routes>
//         </div>
//         <Footer />
//       </div>
//     </Router>
//   );
// }

// export default App;



import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import Homepage from "./components/a1_Homepage/Homepage";
import Navbar from "./components/a2_NavBar/NavBar";
import Footer from "./components/a3_Footer/Footer";
import VideoCreator from "./components/b0_VideoCreator/VideoCreator";

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-grow">
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/create" element={<VideoCreator />} />
            {/* Other routes */}
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;