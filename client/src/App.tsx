import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import Layout from './components/layout/Layout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import RecordPage from './pages/RecordPage';
import Consultations from './pages/Consultations';
import ConsultationDetail from './pages/ConsultationDetail';
import Clients from './pages/Clients';
import Analytics from './pages/Analytics';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Workspace Layout */}
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/record" element={<RecordPage />} />
                <Route path="/consultations" element={<Consultations />} />
                <Route path="/consultations/:id" element={<ConsultationDetail />} />
                <Route path="/clients" element={<Clients />} />
                <Route path="/analytics" element={<Analytics />} />
              </Route>
            </Route>

            {/* Fallback */}
            <Route path="*" element={<div>Page not found</div>} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
