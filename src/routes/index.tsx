import { Routes, Route } from 'react-router-dom';
import { HomePage } from '@/pages/HomePage';
import { TransactionPanel } from '@/pages/TransactionPanel';
import { LoginPage } from '@/pages/LoginPage';
import { NotFound } from '@/pages/NotFound';
import { ProtectedRoute } from './ProtectedRoute';
import { PATHS } from './paths';

export function AppRoutes() {
  return (
    <Routes>
      <Route path={PATHS.login} element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path={PATHS.home} element={<HomePage />}>
          <Route path={PATHS.card.pattern} element={<TransactionPanel />} />
        </Route>
      </Route>
      <Route path={PATHS.notFound} element={<NotFound />} />
    </Routes>
  );
}
