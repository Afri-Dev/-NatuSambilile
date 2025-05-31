import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { USER_ROLES } from '../../constants';

export type UserRole = 'Admin' | 'Instructor' | 'Student';

export type UserStatus = 'active' | 'suspended';

export interface User {
  id: string;
  name?: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt?: string | number | Date;
  progress?: {
    percentage: number;
  };
  gender?: string;
  ageRange?: string;
}

interface UserManagementProps {
  users: User[];
  onUserUpdate: (userId: string, updates: Partial<User>) => Promise<void>;
  onUserDelete: (userId: string) => Promise<void>;
  onCreateUser: (userData: Omit<User, 'id' | 'status'>) => Promise<void>;
  showCreateUserModal: boolean;
  setShowCreateUserModal: (show: boolean) => void;
}

export const UserManagement: React.FC<UserManagementProps> = ({
  users,
  onUserUpdate,
  onUserDelete,
  onCreateUser,
  showCreateUserModal,
  setShowCreateUserModal,
}) => {
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: USER_ROLES.USER,
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email) {
      toast.error('Name and email are required');
      return;
    }
    
    try {
      setIsProcessing(true);
      await onCreateUser({
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      });
      toast.success('User created successfully');
      setNewUser({ name: '', email: '', role: USER_ROLES.USER });
      setShowCreateUserModal(false);
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Failed to create user');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      setIsProcessing(true);
      await onUserUpdate(userId, { role: newRole });
      toast.success('User role updated successfully');
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStatusToggle = async (userId: string, newStatus: 'active' | 'suspended') => {
    try {
      setIsProcessing(true);
      await onUserUpdate(userId, { status: newStatus });
      toast.success(`User ${newStatus === 'active' ? 'activated' : 'suspended'} successfully`);
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Failed to update user status');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        setIsProcessing(true);
        await onUserDelete(userId);
        toast.success('User deleted successfully');
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error('Failed to delete user');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const nonAdminUsers = users.filter(user => user.role !== USER_ROLES.ADMIN);
  const activeUsers = nonAdminUsers.filter(user => user.status === 'active').length;
  const suspendedUsers = nonAdminUsers.filter(user => user.status === 'suspended').length;

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">User Management</h2>
          <p className="text-gray-600">
            Manage platform users and their roles. Currently showing {nonAdminUsers.length} non-admin users.
          </p>
        </div>
        <button 
          onClick={() => setShowCreateUserModal(true)}
          disabled={isProcessing}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center disabled:opacity-50"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add New User
        </button>
      </div>
      
      {/* User Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Total Users</h3>
          <p className="text-3xl font-bold">{nonAdminUsers.length}</p>
          <p className="text-sm text-gray-500">Excluding admins</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Active Users</h3>
          <p className="text-3xl font-bold">{activeUsers}</p>
          <p className="text-sm text-gray-500">Currently active</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Suspended</h3>
          <p className="text-3xl font-bold">{suspendedUsers}</p>
          <p className="text-sm text-gray-500">Accounts suspended</p>
        </div>
      </div>
      
      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {nonAdminUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-600">
                          {user.name?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.name || 'Unnamed User'}
                        </div>
                        <div className="text-sm text-gray-500">
                          Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={user.role}
                      onChange={(e) => {
                        const selectedRole = e.target.value as UserRole;
                        handleRoleChange(user.id, selectedRole);
                      }}
                      disabled={isProcessing}
                      className="text-sm rounded border-gray-300 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50"
                    >
                      {Object.entries(USER_ROLES)
                        .filter(([_, value]) => value !== USER_ROLES.ADMIN)
                        .map(([key, value]) => (
                          <option key={key} value={value}>
                            {value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()}
                          </option>
                        ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {user.status === 'active' ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleStatusToggle(user.id, user.status === 'active' ? 'suspended' : 'active')}
                      disabled={isProcessing}
                      className={`mr-3 ${user.status === 'active' ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'} disabled:opacity-50`}
                    >
                      {user.status === 'active' ? 'Suspend' : 'Activate'}
                    </button>
                    <button 
                      onClick={() => handleDeleteUser(user.id)}
                      disabled={isProcessing}
                      className="text-red-600 hover:text-red-900 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Create User Modal */}
      {showCreateUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Create New User</h3>
              <button 
                onClick={() => !isProcessing && setShowCreateUserModal(false)}
                disabled={isProcessing}
                className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleCreateUser}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={isProcessing}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={isProcessing}
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value as UserRole})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  disabled={isProcessing}
                >
                  {Object.entries(USER_ROLES)
                    .filter(([_, value]) => value !== USER_ROLES.ADMIN)
                    .map(([key, value]) => (
                      <option key={key} value={value}>
                        {value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()}
                      </option>
                    ))}
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateUserModal(false)}
                  disabled={isProcessing}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isProcessing ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
