import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import PwaUpdateToast from '@/components/PwaUpdateToast';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from '@/components/ProtectedRoute';
import AppLayout from '@/components/app/AppLayout';
// Add page imports here
import Landing from './pages/Landing';
import Registo from './pages/Registo';
import Entrar from './pages/Entrar';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Onboarding from './pages/Onboarding';
import Termos from './pages/Termos';
import Privacidade from './pages/Privacidade';
import Home from './pages/app/Home';
import Adicionar from './pages/app/Adicionar';
import Orcamento from './pages/app/Orcamento';
import Transacoes from './pages/app/Transacoes';
import Contas from './pages/app/Contas';
import Pagamentos from './pages/app/Pagamentos';
import Documentos from './pages/app/Documentos';
import Dedutiveis from './pages/app/Dedutiveis';
import Fiscal from './pages/app/Fiscal';
import Assistente from './pages/app/Assistente';
import Perfil from './pages/app/Perfil';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminAudit from './pages/admin/AdminAudit';
import AdminFraud from './pages/admin/AdminFraud';
import AdminPlans from './pages/admin/AdminPlans';
import AdminCompliance from './pages/admin/AdminCompliance';
import PartnerPortal from './pages/partners/PartnerPortal';
import CorporateLayout from './pages/corporate/CorporateLayout';
import CorporateDashboard from './pages/corporate/CorporateDashboard';
import CorporatePayables from './pages/corporate/CorporatePayables';
import CorporateSuppliers from './pages/corporate/CorporateSuppliers';
import CorporateCostCenters from './pages/corporate/CorporateCostCenters';
import CorporateFiscal from './pages/corporate/CorporateFiscal';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      {/* Add your page Route elements here */}
      <Route path="/" element={<Landing />} />
      <Route path="/registo" element={<Registo />} />
      <Route path="/entrar" element={<Entrar />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/termos" element={<Termos />} />
      <Route path="/privacidade" element={<Privacidade />} />
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/entrar" replace />} />}>
        <Route element={<AppLayout />}>
          <Route path="/app" element={<Home />} />
          <Route path="/app/adicionar" element={<Adicionar />} />
          <Route path="/app/orcamento" element={<Orcamento />} />
          <Route path="/app/transacoes" element={<Transacoes />} />
          <Route path="/app/contas" element={<Contas />} />
          <Route path="/app/pagamentos" element={<Pagamentos />} />
          <Route path="/app/documentos" element={<Documentos />} />
          <Route path="/app/dedutiveis" element={<Dedutiveis />} />
          <Route path="/app/fiscal" element={<Fiscal />} />
          <Route path="/app/assistente" element={<Assistente />} />
          <Route path="/app/perfil" element={<Perfil />} />
        </Route>
      </Route>
      {/* Admin backoffice — §01–§06 */}
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/entrar" replace />} />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/antifraude" element={<AdminFraud />} />
          <Route path="/admin/utilizadores" element={<AdminUsers />} />
          <Route path="/admin/planos" element={<AdminPlans />} />
          <Route path="/admin/conformidade" element={<AdminCompliance />} />
          <Route path="/admin/auditoria" element={<AdminAudit />} />
        </Route>
      </Route>
      {/* Partner portal */}
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/entrar" replace />} />}>
        <Route path="/parceiros" element={<PartnerPortal />} />
      </Route>
      {/* Corporate module */}
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/entrar" replace />} />}>
        <Route element={<CorporateLayout />}>
          <Route path="/empresas" element={<CorporateDashboard />} />
          <Route path="/empresas/pagamentos" element={<CorporatePayables />} />
          <Route path="/empresas/fornecedores" element={<CorporateSuppliers />} />
          <Route path="/empresas/centros" element={<CorporateCostCenters />} />
          <Route path="/empresas/fiscal" element={<CorporateFiscal />} />
        </Route>
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
        <PwaUpdateToast />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App