import { CircularProgress } from "@mui/material";
import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";

import { useAuth } from "../contexts/AuthContext";

type ProtectedRouteProps = {
    children: ReactNode;
};

export function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <CircularProgress />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return children;
}