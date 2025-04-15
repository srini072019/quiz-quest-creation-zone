
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import AppRouter from "./router";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <Router>
      <TooltipProvider>
        <Toaster />
        <AuthProvider>
          <AppRouter />
        </AuthProvider>
      </TooltipProvider>
    </Router>
  </QueryClientProvider>
);

export default App;
