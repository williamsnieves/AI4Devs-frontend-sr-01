import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Positions from "./components/Positions";
import PositionPage from "./pages/Position/PositionPage";
import "./App.css";
import "./pages/Position/Position.css";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Navigate to="/positions" replace />} />
          <Route path="/positions" element={<Positions />} />
          <Route path="/positions/:id" element={<PositionPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
