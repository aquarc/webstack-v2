// Replace the entire file with:
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Cookies from 'js-cookie';

const AuthRedirect = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    useEffect(() => {
        const user = Cookies.get('user');
        const publicRoutes = ['/', '/login', '/signup', '/feedback', '/aboutPage', '/extracurricular'];
        const currentPath = location.pathname;
        
        // Redirect authenticated users from public routes to SAT page
        if (user && publicRoutes.includes(currentPath)) {
            navigate('/sat');
        }
        
        // Redirect unauthenticated users from protected routes to landing page
        if (!user && !publicRoutes.includes(currentPath) && currentPath !== '/sat') {
            navigate('/');
        }
    }, [navigate, location]);

    return null;
};

export default AuthRedirect;