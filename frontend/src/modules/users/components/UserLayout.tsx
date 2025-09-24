import React from 'react';
import UserNavigation from '../components/UserNavigation';
import './UserLayout.css';

interface UserLayoutProps {
  children: React.ReactNode;
}

const UserLayout: React.FC<UserLayoutProps> = ({ children }) => {
  return (
    <div className="user-layout">
      <UserNavigation />
      <div className="user-content">
        {children}
      </div>
    </div>
  );
};

export default UserLayout;
