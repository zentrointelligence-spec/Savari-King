import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faSearch,
  faFilter,
  faSync,
  faPlus,
  faEdit,
  faTrash,
  faEnvelope,
  faLockOpen,
  faLock,
  faChartLine,
  faUserShield,
  faUserCheck,
  faUserClock,
} from "@fortawesome/free-solid-svg-icons";
import { apiUtils } from "../../utils/apiUtils";
import {
  FilterButton,
  FilterPanel,
} from "../../components/admin/ReusableFilter";
import ConfirmDeleteModal from "../../components/admin/ConfirmDeleteModal";

const UserRoleBadge = ({ role }) => {
  const roleConfig = {
    administrator: { color: "bg-purple-100 text-purple-800", icon: faUserShield },
    client: { color: "bg-blue-100 text-blue-800", icon: faUser },
    verified: { color: "bg-green-100 text-green-800", icon: faUserCheck },
    pending: { color: "bg-yellow-100 text-yellow-800", icon: faUserClock },
  };

  const config = roleConfig[role] || {
    color: "bg-gray-100 text-gray-800",
    icon: faUser,
  };

  return (
    <div
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.color}`}
    >
      <FontAwesomeIcon icon={config.icon} className="mr-1.5 text-xs" />
      <span className="capitalize">{role}</span>
    </div>
  );
};

const UserRow = ({ user, onEdit, onDelete, onToggleStatus, onSendEmail }) => {
  const [showActions, setShowActions] = useState(false);

  return (
    <tr
      className="border-b hover:bg-gray-50 transition-colors"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <td className="px-6 py-4">
        <div className="flex items-center">
          <div className="bg-gray-200 border-2 border-dashed rounded-full w-10 h-10 flex items-center justify-center">
            <FontAwesomeIcon icon={faUser} className="text-gray-500" />
          </div>
          <div className="ml-4">
            <div className="font-medium text-gray-900">{user.full_name}</div>
            <div className="text-gray-500 text-xs">ID: {user.id}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="text-gray-900">{user.email}</div>
        <div className="text-gray-500 text-xs mt-1">
          Joined {new Date(user.creation_date).toLocaleDateString()}
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex flex-wrap gap-1">
          <UserRoleBadge role={user.role} />
          <UserRoleBadge role={user.is_verified ? "verified" : "pending"} />
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center">
          <div className="flex -space-x-2">
            {(user.recent_activities || []).slice(0, 3).map((activity, idx) => (
              <div
                key={idx}
                className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white"
              />
            ))}
          </div>
          <span className="ml-2 text-gray-500 text-sm">
            {user.activity_count || 0} activities
          </span>
        </div>
      </td>
      <td className="px-6 py-4">
        <button
          onClick={() => onToggleStatus(user.id, !user.is_active)}
          className={`p-2 rounded-full ${
            user.is_active
              ? "text-green-600 hover:bg-green-50"
              : "text-red-600 hover:bg-red-50"
          }`}
          title={user.is_active ? "Deactivate" : "Activate"}
        >
          <FontAwesomeIcon icon={user.is_active ? faLockOpen : faLock} />
        </button>
      </td>
      <td className="px-6 py-4">
        <div
          className={`flex items-center space-x-3 transition-opacity ${
            showActions ? "opacity-100" : "opacity-0"
          }`}
        >
          <button
            onClick={() => onEdit(user)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
            title="Edit"
          >
            <FontAwesomeIcon icon={faEdit} />
          </button>

          <button
            onClick={() => onSendEmail(user)}
            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full"
            title="Send Email"
          >
            <FontAwesomeIcon icon={faEnvelope} />
          </button>

          {user.role !== "administrator" && (
            <button
              onClick={() => onDelete(user.id)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-full"
              title="Delete"
            >
              <FontAwesomeIcon icon={faTrash} />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};

const UserStatsCard = ({ title, value, icon, color, change }) => (
  <div className="bg-white p-5 rounded-xl shadow-lg border-l-4 border-b-0 border-t-0 border-r-0 border-l-4 border-l-${color}">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">
          {title}
        </p>
        <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
      </div>
      <div
        className={`w-12 h-12 rounded-full ${color} bg-opacity-20 flex items-center justify-center`}
      >
        <FontAwesomeIcon icon={icon} className={`text-xl ${color}`} />
      </div>
    </div>
    {change !== undefined && (
      <div
        className={`mt-2 text-sm ${
          change >= 0 ? "text-green-600" : "text-red-600"
        }`}
      >
        <FontAwesomeIcon icon={faChartLine} className="mr-1" />
        {Math.abs(change)}% {change >= 0 ? "increase" : "decrease"} from last
        month
      </div>
    )}
  </div>
);

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isTableLoading, setIsTableLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [verificationStatusFilter, setVerificationStatusFilter] = useState("all");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const { token } = useContext(AuthContext);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers(1, false);
    }, 500); // Debounce search term changes

    return () => clearTimeout(timer);
  }, [searchTerm, roleFilter, statusFilter, verificationStatusFilter, itemsPerPage, token]);

  useEffect(() => {
    fetchUserStats();
  }, [token]);


  const fetchUsers = async (page = 1, showRefresh = true) => {
    if (showRefresh) setRefreshing(true);
    setIsTableLoading(true);
    try {
      const params = {
        page,
        limit: itemsPerPage,
        searchTerm,
        role: roleFilter,
        status: statusFilter,
        verificationStatus: verificationStatusFilter,
      };
      const response = await apiUtils.admin.getUsers(params);
      setUsers(response.data.users);
      setCurrentPage(response.data.currentPage);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Could not fetch users.");
    } finally {
      if (showRefresh) setRefreshing(false);
      setIsTableLoading(false);
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      const response = await apiUtils.admin.getUserStats();
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching user statistics:", error);
      toast.error("Could not fetch user statistics.");
    }
  };


  const handleDelete = (userId) => {
    setUserToDelete(userId);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    try {
      await apiUtils.admin.deleteUser(userToDelete);
      toast.success("User deleted successfully");
      setUsers(users.filter((user) => user.id !== userToDelete));
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user");
    } finally {
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
    }
  };

  const handleToggleStatus = async (userId, newStatus) => {
    try {
      await apiUtils.admin.updateUserStatus(userId, newStatus);
      toast.success(
        `User ${newStatus ? "activated" : "deactivated"} successfully`
      );
      setUsers(
        users.map((user) =>
          user.id === userId ? { ...user, is_active: newStatus } : user
        )
      );
    } catch (error) {
      console.error("Error updating user status:", error);
      toast.error("Failed to update user status");
    }
  };

  const handleSendEmail = (user) => {
    setSelectedUser(user);
    setIsEmailModalOpen(true);
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleCreateUser = () => {
    setIsCreateModalOpen(true);
  };

  const handleUserCreated = (newUser) => {
    setUsers([newUser, ...users]);
    fetchUserStats(); // Refresh stats
    setIsCreateModalOpen(false);
    window.dispatchEvent(new Event("new-user-created"));
  };

  const resetFilters = () => {
    setSearchTerm("");
    setRoleFilter("all");
    setStatusFilter("all");
    setVerificationStatusFilter("all");
  };

  if (loading || !stats) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div className="h-10 w-64 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 w-48 bg-gray-200 rounded animate-pulse"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow-lg p-6 h-32 animate-pulse"
            ></div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-12 bg-gray-100 rounded-lg animate-pulse"
              ></div>
            ))}
          </div>

          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-24 bg-gray-100 rounded-lg animate-pulse"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {isEditModalOpen && selectedUser && (
        <EditUserModal
          user={selectedUser}
          onClose={() => setIsEditModalOpen(false)}
          onSave={(updatedUser) => {
            setUsers(
              users.map((user) =>
                user.id === updatedUser.id ? updatedUser : user
              )
            );
            setIsEditModalOpen(false);
          }}
        />
      )}
      {isEmailModalOpen && selectedUser && (
        <EmailUserModal
          user={selectedUser}
          onClose={() => setIsEmailModalOpen(false)}
        />
      )}
      {isCreateModalOpen && (
        <CreateUserModal
          onClose={() => setIsCreateModalOpen(false)}
          onUserCreated={handleUserCreated}
        />
      )}
      {isDeleteModalOpen && (
        <ConfirmDeleteModal
          onConfirm={confirmDelete}
          onCancel={() => setIsDeleteModalOpen(false)}
          message="Are you sure you want to delete this user? This action cannot be undone and will also delete all associated bookings and reviews."
        />
      )}
      {/* Header with stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
          <p className="text-gray-600 mt-2">
            {stats.total_users} users • {stats.active_users} active •{" "}
            {stats.new_users_today} new today
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={fetchUsers}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <FontAwesomeIcon
              icon={faSync}
              className={`${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
          <FilterButton
            showFilters={showFilters}
            onToggleFilters={() => setShowFilters(!showFilters)}
          />
          <button
            onClick={handleCreateUser}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg shadow-lg hover:shadow-xl transition-all"
          >
            <FontAwesomeIcon icon={faPlus} />
            Add New User
          </button>
        </div>
      </div>

      {/* User statistics cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <UserStatsCard
          title="Total Users"
          value={stats.total_users}
          icon={faUser}
          color="text-blue-500"
          change={stats.user_growth}
        />

        <UserStatsCard
          title="Active Users"
          value={stats.active_users}
          icon={faUserCheck}
          color="text-green-500"
          change={stats.active_growth}
        />

        <UserStatsCard
          title="Pending Verification"
          value={stats.pending_verification}
          icon={faUserClock}
          color="text-yellow-500"
        />

        <UserStatsCard
          title="Admin Users"
          value={stats.admin_users}
          icon={faUserShield}
          color="text-purple-500"
        />
      </div>

      {/* Filters and search */}
      <FilterPanel show={showFilters} onResetFilters={resetFilters}>
        <div className="md:col-span-2">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search users by name, email..."
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FontAwesomeIcon icon={faFilter} className="text-gray-400" />
            </div>
            <select
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent appearance-none"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="all">All Roles</option>
              <option value="administrator">Admin</option>
              <option value="client">User</option>
            </select>
          </div>
        </div>

        <div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FontAwesomeIcon icon={faFilter} className="text-gray-400" />
            </div>
            <select
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent appearance-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>
        <div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FontAwesomeIcon icon={faUserCheck} className="text-gray-400" />
            </div>
            <select
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent appearance-none"
              value={verificationStatusFilter}
              onChange={(e) => setVerificationStatusFilter(e.target.value)}
            >
              <option value="all">All Verification</option>
              <option value="verified">Verified</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>
      </FilterPanel>

      {/* Users table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">
                  User
                </th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">
                  Contact
                </th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">
                  Roles & Status
                </th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">
                  Activity
                </th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">
                  Active
                </th>
                <th className="px-6 py-4 text-center font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {isTableLoading ? (
                <UserTableSkeleton />
              ) : users.length > 0 ? (
                users.map((user) => (
                  <UserRow
                    key={user.id}
                    user={user}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onToggleStatus={handleToggleStatus}
                    onSendEmail={handleSendEmail}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-24 text-center">
                    <div className="text-gray-400 text-xl mb-2">
                      No users found
                    </div>
                    <p className="text-gray-500 max-w-md mx-auto mb-6">
                      {searchTerm
                        ? `No users match your search for "${searchTerm}"`
                        : "All users are filtered out or no users exist"}
                    </p>
                    <button
                      onClick={() => {
                        setSearchTerm("");
                        setRoleFilter("all");
                        setStatusFilter("all");
                      }}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                    >
                      Reset Filters
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination and stats */}
      <div className="flex flex-col md:flex-row justify-between items-center mt-6">
        <div className="text-gray-500 mb-4 md:mb-0">
          Showing {users.length} of {stats.total_users} users
        </div>
        <div className="flex items-center gap-4">
          <div>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="px-2 py-1 border border-gray-300 rounded-lg"
            >
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => fetchUsers(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
          >
            Previous
          </button>
          {[...Array(totalPages).keys()].map((page) => (
            <button
              key={page + 1}
              onClick={() => fetchUsers(page + 1)}
              className={`px-4 py-2 rounded-lg ${
                currentPage === page + 1
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {page + 1}
            </button>
          ))}
            <button
              onClick={() => fetchUsers(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const EditUserModal = ({ user, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    full_name: user.full_name,
    email: user.email,
    role: user.role,
    is_verified: user.is_verified,
    is_active: user.is_active,
  });
  const { token } = useContext(AuthContext);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await apiUtils.admin.updateUser(user.id, formData);
      toast.success("User updated successfully");
      onSave(response.data);
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Failed to update user");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Edit User</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700">Full Name</label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            >
              <option value="client">User</option>
              <option value="administrator">Admin</option>
            </select>
          </div>
          <div className="mb-4 flex items-center">
            <input
              type="checkbox"
              name="is_verified"
              checked={formData.is_verified}
              onChange={handleChange}
              className="mr-2"
            />
            <label className="text-gray-700">Verified</label>
          </div>
          <div className="mb-4 flex items-center">
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              className="mr-2"
            />
            <label className="text-gray-700">Active</label>
          </div>
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-white rounded"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const EmailUserModal = ({ user, onClose }) => {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const { token } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiUtils.admin.sendUserEmail(user.id, { subject, message });
      toast.success("Email sent successfully");
      onClose();
    } catch (error) {
      console.error("Error sending email:", error);
      toast.error("Failed to send email");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">
          Send Email to {user.full_name}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-2 border rounded"
              rows="5"
            ></textarea>
          </div>
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-white rounded"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const CreateUserModal = ({ onClose, onUserCreated }) => {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "client",
  });
  const { token } = useContext(AuthContext);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await apiUtils.admin.createUser(formData);
      toast.success("User created successfully");
      onUserCreated(response.data);
    } catch (error) {
      console.error("Error creating user:", error);
      toast.error(error.response?.data?.error || "Failed to create user");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Create New User</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700">Full Name</label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            >
              <option value="client">User</option>
              <option value="administrator">Admin</option>
            </select>
          </div>
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-white rounded"
            >
              Create User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const UserTableSkeleton = () => (
  <>
    {[...Array(5)].map((_, i) => (
      <tr key={i} className="border-b animate-pulse">
        <td className="px-6 py-4">
          <div className="flex items-center">
            <div className="bg-gray-300 rounded-full w-10 h-10"></div>
            <div className="ml-4 space-y-2">
              <div className="h-4 bg-gray-300 rounded w-24"></div>
              <div className="h-3 bg-gray-300 rounded w-16"></div>
            </div>
          </div>
        </td>
        <td className="px-6 py-4">
          <div className="space-y-2">
            <div className="h-4 bg-gray-300 rounded w-40"></div>
            <div className="h-3 bg-gray-300 rounded w-32"></div>
          </div>
        </td>
        <td className="px-6 py-4">
          <div className="flex flex-wrap gap-1">
            <div className="h-6 w-20 bg-gray-300 rounded-full"></div>
            <div className="h-6 w-20 bg-gray-300 rounded-full"></div>
          </div>
        </td>
        <td className="px-6 py-4">
          <div className="h-4 bg-gray-300 rounded w-24"></div>
        </td>
        <td className="px-6 py-4">
          <div className="h-8 w-8 bg-gray-300 rounded-full"></div>
        </td>
        <td className="px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-gray-300 rounded-full"></div>
            <div className="h-8 w-8 bg-gray-300 rounded-full"></div>
            <div className="h-8 w-8 bg-gray-300 rounded-full"></div>
          </div>
        </td>
      </tr>
    ))}
  </>
);

export default AdminUsersPage;
