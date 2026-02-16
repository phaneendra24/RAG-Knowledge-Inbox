import './App.css';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './components/app-sidebar';
import { ThemeProvider } from '@/components/theme-provider';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/home';
import NotesPage from './pages/notes';
import UrlsPage from './pages/urls';
import { Toaster } from '@/components/ui/sonner';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <BrowserRouter>
          <SidebarProvider>
            <AppSidebar />
            <main className="w-full h-screen flex flex-col">
              <div className="flex items-center p-2 border-b">
                <SidebarTrigger />
              </div>
              <div className="flex-1 overflow-hidden h-full">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/notes" element={<NotesPage />} />
                  <Route path="/urls" element={<UrlsPage />} />
                </Routes>
              </div>
            </main>
          </SidebarProvider>
        </BrowserRouter>
        <Toaster position="top-center" />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
