// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import AuthPage from "./pages/AuthPage";
import ReviewsPage from "./pages/ReviewsPage";
import UploadPage from "./pages/UploadPage";
import SelectParty from "./pages/SelectParty";
import AnalysisResult from "./pages/AnalysisResult";
import AdvancedTools from "./pages/AdvancedTools";
import WorkspaceChoice from "./pages/WorkspaceChoice";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile"; 
import Teams from "./pages/Teams";
import Notifications from "./pages/Notifications"; 
import AIToolsPage from "./pages/AIToolsPage";  

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
        <Route path="/advanced-tools" element={<AdvancedTools />} />
        <Route path="/workspace-choice" element={<WorkspaceChoice />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/teams" element={<Teams />} />
        <Route path="/notifications" element={<Notifications />} /> 
         <Route path="/tools" element={<AIToolsPage />} />  
      </Routes>
    </Router>
  );
}

export default App;