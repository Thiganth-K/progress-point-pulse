
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Award } from "lucide-react";
import Navbar from "./Navbar";
import AttendancePanel from "./AttendancePanel";
import LeaderboardPanel from "./LeaderboardPanel";

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activePanel, setActivePanel] = useState<"welcome" | "attendance" | "leaderboard">("welcome");

  if (!user) {
    navigate("/");
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-950">
      <Navbar 
        activePanel={activePanel !== "welcome" ? activePanel : undefined} 
        setActivePanel={(panel) => setActivePanel(panel)} 
      />

      <div className="container mx-auto flex-grow py-6">
        {activePanel === "welcome" && <WelcomeView onNavigate={setActivePanel} />}
        {activePanel === "attendance" && <AttendancePanel />}
        {activePanel === "leaderboard" && <LeaderboardPanel />}
      </div>
    </div>
  );
};

interface WelcomeViewProps {
  onNavigate: (panel: "attendance" | "leaderboard") => void;
}

const WelcomeView = ({ onNavigate }: WelcomeViewProps) => {
  const { user } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center h-full py-12 animate-fade-in">
      <div className="text-center space-y-4 max-w-lg">
        <h1 className="text-4xl font-bold text-gradient">Welcome, {user?.displayName}!</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          Select a panel to get started with the ProgressPoint dashboard.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12 w-full max-w-4xl">
        <Card className="glassmorphism hover:scale-105 transition-all duration-300">
          <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold">Attendance Panel</h2>
            <p className="text-gray-500 dark:text-gray-400">
              Mark and view student attendance records with an easy-to-use interface.
            </p>
            <Button 
              onClick={() => onNavigate("attendance")}
              className="w-full bg-gradient-to-r from-primary-600 to-blue-500 hover:from-primary-700 hover:to-blue-600"
            >
              Go to Attendance
            </Button>
          </CardContent>
        </Card>

        <Card className="glassmorphism hover:scale-105 transition-all duration-300">
          <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
              <Award className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h2 className="text-2xl font-bold">Leaderboard Panel</h2>
            <p className="text-gray-500 dark:text-gray-400">
              Update student marks and view performance rankings in real-time.
            </p>
            <Button 
              onClick={() => onNavigate("leaderboard")}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-500 hover:from-indigo-700 hover:to-purple-600"
            >
              Go to Leaderboard
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
