import React from 'react';
import { Navigate } from 'react-router-dom';
import { getPayload } from '../lib/auth';

interface RoleRouteProps {
    children: React.ReactNode;
    requiredRole: string;
}

export default function RoleRoute({ children, requiredRole }: RoleRouteProps) {
    const userPayload = getPayload();

    // If not logged in or role doesn't match
    if (!userPayload || userPayload.role !== requiredRole) {
        // Optional: Redirect to unauthorized page or dashboard
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
}
