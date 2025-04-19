
import { useAuth } from "@/context/AuthContext";
import LoginPage from "@/components/LoginPage";
import AdminDashboard from "@/components/AdminDashboard";

const Index = () => {
  const { user } = useAuth();

  return user ? <AdminDashboard /> : <LoginPage />;
};

export default Index;
