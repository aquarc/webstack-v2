import React, { useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import Cookies from 'js-cookie';

// Use this for public routes (login, landing page, etc.)
export const PublicRouteGuard = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const user = Cookies.get('user');
        if (user) {
            // Redirect to dashboard ONLY if trying to access public routes
            navigate('/sat');
        }
    }, [navigate]);

    return <Outlet />;
};

// Use this for protected routes (dashboard, sat, etc.)
export const ProtectedRouteGuard = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const user = Cookies.get('user');
        if (!user) {
            // Redirect to landing page if not authenticated
            navigate('/');
        }
    }, [navigate]);

    return <Outlet />;
};