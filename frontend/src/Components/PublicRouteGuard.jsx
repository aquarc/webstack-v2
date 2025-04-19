import React, { useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import Cookies from 'js-cookie';

// Update PublicRouteGuard component
export const PublicRouteGuard = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const user = Cookies.get('user');
        // Only redirect from auth pages if logged in
        if (user && ['/login', '/signup'].includes(location.pathname)) {
            navigate('/sat');
        }
    }, [navigate, location]);

    return <Outlet />;
};