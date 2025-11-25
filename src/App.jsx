// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import AuthPage from "./pages/AuthPage";
import ReviewsPage from "./pages/ReviewsPage";
import UploadPage from "./pages/UploadPage";
import SelectParty from "./pages/SelectParty";
import AnalysisResult from "./pages/AnalysisResult";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/reviews" element={<ReviewsPage />} />
          <Route path="/upload" element={<UploadPage />} /> 
          <Route path="/select-party" element={<SelectParty />} />
        <Route path="/analysis-result" element={<AnalysisResult />} />
   
      </Routes>
    </Router>
  );
}

export default App;
