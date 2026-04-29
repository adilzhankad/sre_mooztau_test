import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth-store";
import { ProtectedRoute, BuyerProtectedRoute } from "@/components/ProtectedRoute";
import { TabLayout } from "@/components/TabLayout";
import { getDefaultRoute } from "@/lib/permissions";
import { LoginPage } from "@/pages/LoginPage";
import { OrdersPage } from "@/pages/OrdersPage";
import { OrderDetailPage } from "@/pages/OrderDetailPage";
import { CreateOrderPage } from "@/pages/CreateOrderPage";
import { ProductsPage } from "@/pages/ProductsPage";
import { UsersPage } from "@/pages/UsersPage";
import { OrganizationsPage } from "@/pages/OrganizationsPage";
import { FactoryPage } from "@/pages/factorypage";
import { FactoryOrderDetailPage } from "@/pages/FactoryOrderDetailPage";
import { InventoryPage } from "@/pages/InventoryPage";
import { AnalyticsPage } from "@/pages/AnalyticsPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { FinancesPage } from "@/pages/FinancesPage";
import { TransactionsPage } from "@/pages/TransactionsPage";
import { CreateTransactionPage } from "@/pages/CreateTransactionPage";
import { QCQueuePage } from "@/pages/QCQueuePage";
import { QCChecklistPage } from "@/pages/QCChecklistPage";
import { LogisticsPage } from "@/pages/LogisticsPage";
import { AuditPage } from "@/pages/AuditPage.tsx";
import { ChatPage } from "@/pages/ChatPage";
import { ServicePage } from "@/pages/ServicePage";
import { MasterDeliveriesPage } from "@/pages/MasterDeliveriesPage";
import { BuyerHomePage } from "@/pages/BuyerHomePage";
import { BuyerOrdersPage } from "@/pages/BuyerOrdersPage";
import { BuyerOrderDetailPage } from "@/pages/BuyerOrderDetailPage";
import { BuyerServicePage } from "@/pages/BuyerServicePage";
import { BuyerMessagesPage } from "@/pages/BuyerMessagesPage";
import { BuyerProfilePage } from "@/pages/BuyerProfilePage";
import { BuyerLayout } from "@/components/BuyerLayout";
import { PublicServiceRequestPage } from "@/pages/PublicServiceRequestPage";

function DefaultRedirect() {
  const role = useAuthStore((s) => s.role);
  return <Navigate to={getDefaultRoute(role)} replace />;
}

export function App() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const role = useAuthStore((s) => s.role);

  return (
    <BrowserRouter>
      <Routes>
        {/* ── Public: Staff login ── */}
        <Route
          path="/login"
          element={
            isAuthenticated
              ? <Navigate to={getDefaultRoute(role)} replace />
              : <LoginPage />
          }
        />

        {/* Buyer login был отдельным — теперь единая страница /login. Оставляем redirect на случай старых ссылок. */}
        <Route path="/buyer/login" element={<Navigate to="/login" replace />} />
        <Route path="/buyer/service/new" element={<PublicServiceRequestPage />} />

        {/* ── Buyer protected routes ── */}
        <Route element={<BuyerProtectedRoute />}>
          <Route element={<BuyerLayout />}>
            <Route path="buyer" element={<Navigate to="/buyer/home" replace />} />
            <Route path="buyer/home" element={<BuyerHomePage />} />
            <Route path="buyer/orders" element={<BuyerOrdersPage />} />
            <Route path="buyer/orders/:id" element={<BuyerOrderDetailPage />} />
            <Route path="buyer/service" element={<BuyerServicePage />} />
            <Route path="buyer/messages" element={<BuyerMessagesPage />} />
            <Route path="buyer/profile" element={<BuyerProfilePage />} />
          </Route>
        </Route>

        {/* ── Staff protected routes ── */}
        <Route element={<ProtectedRoute />}>
          <Route element={<TabLayout />}>
            <Route index element={<DefaultRedirect />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="orders/new" element={<CreateOrderPage />} />
            <Route path="orders/:id" element={<OrderDetailPage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="organizations" element={<OrganizationsPage />} />
            <Route path="factory" element={<FactoryPage />} />
            <Route path="factory/orders/:id" element={<FactoryOrderDetailPage />} />
            <Route path="factory/inventory" element={<InventoryPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="finances" element={<FinancesPage />} />
            <Route path="transactions" element={<TransactionsPage />} />
            <Route path="transactions/new" element={<CreateTransactionPage />} />
            <Route path="qc" element={<QCQueuePage />} />
            <Route path="qc/:id" element={<QCChecklistPage />} />
            <Route path="logistics" element={<LogisticsPage />} />
            <Route path="service" element={<ServicePage />} />
            <Route path="master/deliveries" element={<MasterDeliveriesPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="chat" element={<ChatPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["SUPER_ADMIN"]} redirectTo="/orders" />}>
          <Route element={<TabLayout />}>
            <Route path="audit" element={<AuditPage />} />
          </Route>
        </Route>

        {/* ── Fallback ── */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
