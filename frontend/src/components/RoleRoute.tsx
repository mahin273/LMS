import React from 'react';
import { Navigate } from 'react-router-dom';
import { getPayload } from '../lib/auth';

interface RoleRouteProps {
    children: React.ReactNode;
    requiredRole: string | string[];
}

export default function RoleRoute({ children, requiredRole }: RoleRouteProps) {
    const userPayload = getPayload();

    // If not logged in or role doesn't match
    if (!userPayload) {
        return <Navigate to="/dashboard" replace />;
    }

    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];

    if (!roles.includes(userPayload.role)) {
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
}
