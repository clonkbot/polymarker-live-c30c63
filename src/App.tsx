import { useConvexAuth } from "convex/react";
import { Dashboard } from "./components/Dashboard";
import { AuthScreen } from "./components/AuthScreen";
import { LoadingScreen } from "./components/LoadingScreen";
import "./styles.css";

export default function App() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="app-container">
      <div className="scanlines" />
      <div className="noise-overlay" />

      {isAuthenticated ? <Dashboard /> : <AuthScreen />}

      <footer className="app-footer">
        <span>Requested by @web-user · Built by @clonkbot</span>
      </footer>
    </div>
  );
}
