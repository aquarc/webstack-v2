import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Cookies from 'js-cookie';

const AuthRedirect = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    useEffect(() => {
        const user = Cookies.get('user');
        const publicRoutes = ['/', '/login', '/signup', '/feedback', '/aboutPage', '/extracurricular', '/sat'];
        const isDashboardRoute = location.pathname === '/dashboard';
        const isDashboardSubRoute = location.pathname.startsWith('/overview') || 
                                   location.pathname.startsWith('/analytics') || 
                                   location.pathname.startsWith('/ec-finder') || 
                                   location.pathname.startsWith('/sat-prep');
        const currentPath = location.pathname;
        
        // Redirect authenticated users from public routes to overview
        if (user && publicRoutes.includes(currentPath)) {
            navigate('/overview');
        }
        
        // Redirect unauthenticated users from protected routes to landing page
        if (!user && !publicRoutes.includes(currentPath)) {
            navigate('/');
        }

        // Redirect from /dashboard to /overview
        if (user && isDashboardRoute) {
            navigate('/overview');
        }
    }, [navigate, location]);

    return null;
};

export default AuthRedirect;