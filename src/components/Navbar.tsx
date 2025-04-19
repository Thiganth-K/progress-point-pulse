
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";

interface NavbarProps {
  activePanel?: "attendance" | "leaderboard";
  setActivePanel?: (panel: "attendance" | "leaderboard") => void;
}

const Navbar = ({ activePanel, setActivePanel }: NavbarProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-md glassmorphism sticky top-0 z-10 py-4">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gradient">ProgressPoint</h1>
          {user && (
            <span className="hidden sm:inline-block text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-md">
              {user.displayName}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {user && setActivePanel && (
            <div className="flex space-x-2 mr-4">
              <Button
                variant={activePanel === "attendance" ? "default" : "outline"}
                size="sm"
                onClick={() => setActivePanel("attendance")}
                className={activePanel === "attendance" ? "bg-primary-600" : ""}
              >
                Attendance
              </Button>
              <Button
                variant={activePanel === "leaderboard" ? "default" : "outline"}
                size="sm"
                onClick={() => setActivePanel("leaderboard")}
                className={activePanel === "leaderboard" ? "bg-primary-600" : ""}
              >
                Leaderboard
              </Button>
            </div>
          )}

          <ThemeToggle />

          {user && (
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
