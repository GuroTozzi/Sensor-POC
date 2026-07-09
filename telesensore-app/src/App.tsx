import { Navigate, Route, Routes } from "react-router-dom";
import { AppStateProvider } from "./state/AppStateContext";
import { ConnectionPage } from "./pages/ConnectionPage";
import { VisualizationLayout } from "./pages/VisualizationLayout";
import { VisualizationGraphsPage } from "./pages/VisualizationGraphsPage";
import { Visualization3DPage } from "./pages/Visualization3DPage";
import { ConfigurationPage } from "./pages/ConfigurationPage";

function App() {
  return (
    <AppStateProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/connection/unreachable" replace />} />
        <Route path="/connection/:state" element={<ConnectionPage />} />
        <Route path="/visualization" element={<VisualizationLayout />}>
          <Route path="graphs" element={<VisualizationGraphsPage />} />
          <Route path="3d" element={<Visualization3DPage />} />
        </Route>
        <Route path="/configuration" element={<ConfigurationPage />} />
        <Route path="*" element={<Navigate to="/connection/unreachable" replace />} />
      </Routes>
    </AppStateProvider>
  );
}

export default App;
