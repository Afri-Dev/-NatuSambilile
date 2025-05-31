import React from 'react';
import { User, UserRole } from '../../../types';
import { USER_ROLES, UserPlusIcon, EditIcon, UserMinusIcon } from '../../../constants';

interface UserManagementProps {
  users: User[];
  currentUser: User | null;
  onUpdateUserRole: (userId: string) => void;
  onDeleteUser: (userId: string, username: string) => void;
  editingUserRole: { userId: string; role: UserRole } | null;
  onRoleChange: (userId: string, newRole: UserRole) => void;
  onOpenCreateInstructor: () => void;
  isLoadingAction: boolean;
}

export const UserManagement: React.FC<UserManagementProps> = ({
  users,
  currentUser,
  onUpdateUserRole,
  onDeleteUser,
  editingUserRole,
  onRoleChange,
  onOpenCreateInstructor,
  isLoadingAction,
}) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg mt-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-primary-dark">User Management</h2>
        <button
          onClick={onOpenCreateInstructor}
          className="bg-secondary hover:bg-secondary-dark text-white font-semibold py-2 px-4 rounded-lg shadow-sm flex items-center space-x-2 transition-colors"
          aria-label="Create New Instructor"
        >
          <UserPlusIcon className="w-5 h-5" />
          <span>Create New Instructor</span>
        </button>
      </div>

      {isLoadingAction && (
        <div className="my-2 flex items-center">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
          <span className="ml-2 text-neutral-dark">Processing...</span>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-neutral">
          <thead className="bg-neutral-lightest">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">
                Username
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">
                Email
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">
                Role
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-dark uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-neutral">
            {users.map((user) => {
              const isCurrentUserAdmin = currentUser?.id === user.id;
              const isTargetAdmin = user.role === USER_ROLES.ADMIN;
              const canManageUser = !isCurrentUserAdmin && !isTargetAdmin;

              let isUpdateRoleDisabled = isLoadingAction;
              if (canManageUser) {
                isUpdateRoleDisabled =
                  isLoadingAction ||
                  !editingUserRole ||
                  editingUserRole.userId !== user.id ||
                  editingUserRole.role === user.role;
              }

              return (
                <tr
                  key={user.id}
                  className={`hover:bg-neutral-lightest transition-colors ${
                    isTargetAdmin ? 'bg-primary-light/10' : ''
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-darker flex items-center">
                    {isTargetAdmin && (
                      <span className="w-5 h-5 text-primary mr-2" title="Admin Account">
                        👑
                      </span>
                    )}
                    {user.username}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-dark">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-dark">
                    {canManageUser ? (
                      <select
                        value={editingUserRole?.userId === user.id ? editingUserRole.role : user.role}
                        onChange={(e) => onRoleChange(user.id, e.target.value as UserRole)}
                        className="p-1 border border-neutral-medium rounded-md text-sm focus:ring-primary focus:border-primary bg-transparent"
                        disabled={isLoadingAction}
                      >
                        <option value={USER_ROLES.STUDENT}>{USER_ROLES.STUDENT}</option>
                        <option value={USER_ROLES.INSTRUCTOR}>
                          {USER_ROLES.INSTRUCTOR}
                        </option>
                      </select>
                    ) : (
                      user.role
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    {canManageUser ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => onUpdateUserRole(user.id)}
                          className={`p-1.5 rounded-full hover:bg-neutral-light transition-all duration-200 ${
                            isUpdateRoleDisabled ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                          disabled={isUpdateRoleDisabled}
                          title="Update Role"
                        >
                          <EditIcon className="w-5 h-5 text-primary hover:scale-110 transition-transform" />
                        </button>
                        <button
                          onClick={() => onDeleteUser(user.id, user.username)}
                          className="p-1.5 rounded-full hover:bg-neutral-light transition-all duration-200"
                          disabled={isLoadingAction}
                          title="Delete User"
                        >
                          <UserMinusIcon className="w-5 h-5 text-error hover:scale-110 transition-transform" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-neutral-dark italic">
                        {isCurrentUserAdmin ? 'Current Admin' : isTargetAdmin ? 'Admin Account' : 'N/A'}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;
