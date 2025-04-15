
import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { useAuth } from "@/context/AuthContext";
import { ROUTES } from "@/constants/routes";

interface CandidateLayoutProps {
  children: ReactNode;
}

const CandidateLayout = ({ children }: CandidateLayoutProps) => {
  const { authState, logout } = useAuth();
  
  // Protect the route - redirect if not candidate
  if (authState.isLoading) {
    return <div>Loading...</div>;
  }
  
  if (!authState.isAuthenticated || authState.user?.role !== "candidate") {
    return <Navigate to={ROUTES.LOGIN} />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar 
        role="candidate" 
        isAuthenticated={true} 
        onLogout={logout}
      />
      <main className="flex-1 py-8">
        <div className="assessify-container">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CandidateLayout;
