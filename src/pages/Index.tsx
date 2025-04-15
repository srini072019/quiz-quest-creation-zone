
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { useEffect } from "react";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to home page
    navigate(ROUTES.HOME);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Redirecting...</h1>
        <p className="text-xl text-gray-600">Please wait while we redirect you to the home page.</p>
      </div>
    </div>
  );
};

export default Index;
