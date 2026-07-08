import { Navigate, Route, Routes } from "react-router-dom";
import { AppStateProvider } from "./state/AppStateContext";
import { ConnectionPage } from "./pages/ConnectionPage";
import { VisualizationGraphsPage } from "./pages/VisualizationGraphsPage";
import { Visualization3DPage } from "./pages/Visualization3DPage";
import { ConfigurationPage } from "./pages/ConfigurationPage";

function App() {
  return (
    <AppStateProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/connection/unreachable" replace />} />
        <Route path="/connection/:state" element={<ConnectionPage />} />
        <Route path="/visualization/graphs" element={<VisualizationGraphsPage />} />
        <Route path="/visualization/3d" element={<Visualization3DPage />} />
        <Route path="/configuration" element={<ConfigurationPage />} />
        <Route path="*" element={<Navigate to="/connection/unreachable" replace />} />
      </Routes>
    </AppStateProvider>
  );
}

export default App;
