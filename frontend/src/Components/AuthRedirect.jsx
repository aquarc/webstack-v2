// Components/AuthRedirect.js
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Cookies from 'js-cookie';

const AuthRedirect = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    useEffect(() => {
        const user = Cookies.get('user');
        const publicRoutes = ['/', '/login', '/signup', '/feedback', '/aboutPage'];
        const currentPath = location.pathname;
        
        // Only redirect to dashboard if user is authenticated AND on a public route
        if (user && publicRoutes.includes(currentPath)) {
            navigate('/dashboard');
        }
        
        // Redirect to landing page if user is not authenticated AND on a protected route
        if (!user && !publicRoutes.includes(currentPath)) {
            navigate('/');
        }
    }, [navigate, location]);

    return null;
};

export default AuthRedirect;