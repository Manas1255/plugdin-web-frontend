import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './VendorGuard.css';

interface VendorGuardProps {
  children: ReactNode;
}

export const VendorGuard = ({ children }: VendorGuardProps) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/auth?redirect=/add-service/details" replace />;
  }

  if (user?.role !== 'vendor') {
    return (
      <div className="vendor-guard-block">
        <div className="vendor-guard-content">
          <h2>Vendor Access Required</h2>
          <p>Only vendors can access this page. Please apply to become a vendor to add services.</p>
          <div className="vendor-guard-actions">
            <a href="/" className="btn btn-secondary">
              Go Home
            </a>
            <a href="/apply-as-vendor" className="btn btn-primary">
              Apply as Vendor
            </a>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
