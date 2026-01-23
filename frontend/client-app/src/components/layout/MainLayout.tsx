import React from 'react';
import { useLocation } from 'react-router-dom';

const MainLayout = ({ children }: { children?: React.ReactNode }) => {
    const location = useLocation();
    const transparentPaths = ['/', '/institutions', '/courses', '/scholarships', '/tools', '/blog'];
    const searchParams = new URLSearchParams(location.search);
    const isToolSubView = location.pathname === '/tools' && searchParams.has('tool');
    const isHeroPath = transparentPaths.includes(location.pathname) && !isToolSubView;
    const isChatPath = location.pathname === '/chat';

    return (
        <main className={`flex-grow flex flex-col ${isChatPath ? 'h-[calc(100vh-80px)] pt-[80px]' : (isHeroPath ? 'pt-0' : 'pt-[88px]')}`}>
            {children}
        </main>
    );
};

export default MainLayout;
