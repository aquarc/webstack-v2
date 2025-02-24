import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const AuthRedirect = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const user = Cookies.get('user');
        if (user) {
            navigate('/dashboard');
        }
    }, [navigate]);

    return null;
};

export default AuthRedirect;