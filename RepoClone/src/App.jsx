import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Game from "./client/components/Game.tsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/play" element={<Game />} />
      <Route path="*" element={<Home />} />
    </Routes>
  );
}
