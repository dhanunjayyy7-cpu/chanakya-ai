import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import ShaderBackground from "./components/ShaderBackground";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <div className="min-h-screen bg-cover bg-center bg-no-repeat bg-fixed relative overflow-hidden">
        {/* Background image with slow zoom */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat animate-bg-zoom"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1920&q=80')`,
          }}
        />
        {/* Dark overlay */}
        <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.82)' }} />
        {/* Content */}
        <div className="relative z-10 min-h-screen">
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </div>
      </div>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
