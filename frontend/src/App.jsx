import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import ProtectedRoute from './routes/ProtectedRoute';
import MainLayout from './layouts/MainLayout';
import SessionTimeoutGuard from './components/SessionTimeoutGuard';
import Dashboard from './pages/Dashboard';
import FarmersList from './pages/Farmers';
import FarmerProfile from './pages/Farmers/FarmerProfile';
import CollectionsList from './pages/Collections';
import PaymentsList from './pages/Payments';
import CustomersList from './pages/Customers';
import CustomerProfile from './pages/Customers/CustomerProfile';
import CustomerDues from './pages/Customers/Dues';
import SalesList from './pages/Sales';
import InventoryModule from './pages/Inventory';
import ProductsModule from './pages/Products';
import EmployeesModule from './pages/Employees';
import ExpensesModule from './pages/Expenses';
import BillingModule from './pages/Billing';
import Settings from './pages/Settings';
import Profile from './pages/Profile';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={
            <SessionTimeoutGuard>
              <MainLayout />
            </SessionTimeoutGuard>
          }>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/farmers" element={<FarmersList />} />
            <Route path="/farmers/:id" element={<FarmerProfile />} />
            <Route path="/collections" element={<CollectionsList />} />
            <Route path="/payments" element={<PaymentsList />} />
            <Route path="/customers" element={<CustomersList />} />
            <Route path="/customers/:id" element={<CustomerProfile />} />
            <Route path="/dues" element={<CustomerDues />} />
            <Route path="/sales" element={<SalesList />} />
            <Route path="/inventory" element={<InventoryModule />} />
            <Route path="/products" element={<ProductsModule />} />
            <Route path="/employees" element={<EmployeesModule />} />
            <Route path="/expenses" element={<ExpensesModule />} />
            <Route path="/billing" element={<BillingModule />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Route>
        
        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
