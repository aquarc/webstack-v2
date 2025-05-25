import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Cookies from 'js-cookie';

const AuthRedirect = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const user = Cookies.get('user');
        const publicRoutes = ['/login', '/signup'];
        const currentPath = location.pathname;

        // Only redirect if trying to access auth-related pages while logged in
        if (user && publicRoutes.includes(currentPath)) {
            navigate('/sat');
        }

        // Redirect unauthenticated users from protected routes
        const protectedRoutes = ['/user-profile', '/progress']; // Add any protected routes here
        if (!user && protectedRoutes.includes(currentPath)) {
            navigate('/');
        }
    }, [navigate, location]);

    return null;
};

export default AuthRedirect;
