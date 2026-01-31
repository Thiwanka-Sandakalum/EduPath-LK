import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export const ScrollToTop = () => {
    const { pathname } = useLocation();
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);
    return null;
};

export const ForceHome = () => {
    const navigate = useNavigate();
    useEffect(() => {
        const sessionKey = 'edupath_init_load_complete';
        if (!sessionStorage.getItem(sessionKey)) {
            sessionStorage.setItem(sessionKey, 'true');
            navigate('/', { replace: true });
        }
    }, [navigate]);
    return null;
};

export const ScrollObserver = () => {
    const location = useLocation();
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        const elements = document.querySelectorAll('.reveal');
        elements.forEach((el) => observer.observe(el));

        const mutationObserver = new MutationObserver(() => {
            document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
        });
        mutationObserver.observe(document.body, { childList: true, subtree: true });

        return () => {
            observer.disconnect();
            mutationObserver.disconnect();
        };
    }, [location.pathname]);
    return null;
};
