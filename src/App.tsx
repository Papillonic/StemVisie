// src/App.tsx
import { Routes, Route } from "react-router-dom";

import WelcomePage from "./pages/WelcomePage";
import FilterPage from "./pages/FilterPage";
import VotingPage from "./pages/VotingPage";
import ResultPage from "./pages/ResultPage";
import MotieDetailPage from "./pages/MotieDetailPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<WelcomePage />} />
      <Route path="/filter" element={<FilterPage />} />
      <Route path="/voting" element={<VotingPage />} />
      <Route path="/result" element={<ResultPage />} />
      <Route path="/detail" element={<MotieDetailPage />} />
    </Routes>
  );
}
