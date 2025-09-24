import React from 'react';
import UserLayout from '../components/UserLayout';
import UserList from '../components/UserList';

const UsersHomePage: React.FC = () => {
  return (
    <UserLayout>
      <UserList />
    </UserLayout>
  );
};

export default UsersHomePage;
