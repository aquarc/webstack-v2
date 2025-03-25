import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Cookies from 'js-cookie';

const AuthRedirect = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    useEffect(() => {
        const user = Cookies.get('user');
        const publicRoutes = [
            '/', 
            '/login', 
            '/signup', 
            '/feedback', 
            '/aboutPage', 
            '/extracurricular', 
            '/sat'
        ];
        const dashboardRoutes = [
            '/dashboard/overview',
            '/dashboard/analytics',
            '/dashboard/ec-finder',
            '/dashboard/sat-prep',
            '/dashboard/sat'
        ];
        const currentPath = location.pathname;
        
        // Redirect authenticated users from public routes to dashboard overview
        if (user && publicRoutes.includes(currentPath)) {
            navigate('/dashboard/overview');
        }
        
        // Redirect unauthenticated users from protected routes to landing page
        if (!user && (dashboardRoutes.includes(currentPath) || currentPath.startsWith('/dashboard'))) {
            navigate('/');
        }
    }, [navigate, location]);

    return null;
};

export default AuthRedirect;