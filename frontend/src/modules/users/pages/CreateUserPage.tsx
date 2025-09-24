import React from 'react';
import UserLayout from '../components/UserLayout';
import UserForm from '../components/UserForm';

const CreateUserPage: React.FC = () => {
  return (
    <UserLayout>
      <UserForm isEditing={false} />
    </UserLayout>
  );
};

export default CreateUserPage;
