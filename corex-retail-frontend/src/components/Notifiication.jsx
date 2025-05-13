import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../contexts/NotificationContext';
import { collection, getDocs } from 'firebase/firestore';
import { db, auth } from '../../firebase/config';

const CreateNotification = () => {
  const navigate = useNavigate();
  const { createNotification } = useNotifications();
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    priority: 'medium',
    targetRole: '',
    targetUsers: [],
    targetStores: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [userRole, setUserRole] = useState(null);
  
  // Dropdown options
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  
  // Fetch user role on mount
  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          navigate('/login');
          return;
        }
        
        const userDoc = await db.collection('users').doc(user.uid).get();
        const userData = userDoc.data();
        
        if (!userData || (userData.role !== 'admin' && userData.role !== 'manager')) {
          navigate('/');
          return;
        }
        
        setUserRole(userData.role);
        
        // Set default target role based on user's role
        setFormData(prev => ({
          ...prev,
          targetRole: userData.role === 'admin' ? 'all' : 'staff'
        }));
      } catch (err) {
        console.error('Error fetching user role:', err);
        setError('Failed to verify permissions');
      }
    };
    
    fetchUserRole();
  }, [navigate]);
  
  // Fetch users and stores for dropdowns
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Only fetch if user is admin or manager
        if (!userRole) return;
        
        // Fetch users
        const usersQuery = await getDocs(collection(db, 'users'));
        const usersData = [];
        
        usersQuery.forEach((doc) => {
          const userData = doc.data();
          // For managers, only show staff users
          if (userRole === 'manager' && userData.role !== 'staff') {
            return;
          }
          
          usersData.push({
            id: doc.id,
            name: `${userData.firstName} ${userData.lastName}`,
            role: userData.role,
            email: userData.email
          });
        });
        
        setUsers(usersData);
        
        // Fetch stores
        const storesQuery = await getDocs(collection(db, 'stores'));
        const storesData = [];
        
        storesQuery.forEach((doc) => {
          const storeData = doc.data();
          // For managers, only show their store
          if (userRole === 'manager' && auth.currentUser.uid !== storeData.managerId) {
            return;
          }
          
          storesData.push({
            id: doc.id,
            name: storeData.name,
            location: storeData.location
          });
        });
        
        setStores(storesData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data');
      }
    };
    
    fetchData();
  }, [userRole]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleMultiSelectChange = (e) => {
    const { name, options } = e.target;
    const selectedValues = Array.from(options)
      .filter(option => option.selected)
      .map(option => option.value);
    
    setFormData({
      ...formData,
      [name]: selectedValues
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      // Prepare notification data
      const notificationData = {
        ...formData
      };
      
      // Add action if destination is provided
      if (formData.actionDestination) {
        notificationData.action = {
          type: 'link',
          destination: formData.actionDestination,
          label: formData.actionLabel || 'View'
        };
      }
      
      // Create notification
      await createNotification(notificationData);
      
      // Show success message
      setSuccess(true);
      setFormData({
        title: '',
        message: '',
        priority: 'medium',
        targetRole: userRole === 'admin' ? 'all' : 'staff',
        targetUsers: [],
        targetStores: [],
        actionDestination: '',
        actionLabel: ''
      });
      
      // Navigate back after short delay
      setTimeout(() => {
        navigate('/notifications');
      }, 2000);
    } catch (err) {
      console.error('Error creating notification:', err);
      setError(err.message || 'Failed to create notification');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto py-6 px-4 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Create Notification</h1>
        <button
          onClick={() => navigate('/notifications')}
          className="px-4 py-2 text-sm bg-gray-200 rounded-md hover:bg-gray-300"
        >
          Back to Notifications
        </button>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          Notification created successfully!
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">
            Title *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">
            Message *
          </label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">
            Priority
          </label>
          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">
            Target Audience *
          </label>
          <select
            name="targetRole"
            value={formData.targetRole}
            onChange={handleChange}
            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select a target</option>
            {userRole === 'admin' && (
              <>
                <option value="all">All Users</option>
                <option value="admin">Admins Only</option>
                <option value="manager">Store Managers Only</option>
              </>
            )}
            <option value="staff">Staff Members Only</option>
            <option value="specific">Specific Users</option>
          </select>
        </div>
        
        {formData.targetRole === 'specific' && (
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Select Specific Users *
            </label>
            <select
              name="targetUsers"
              multiple
              value={formData.targetUsers}
              onChange={handleMultiSelectChange}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
              required={formData.targetRole === 'specific'}
            >
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.email}) - {user.role}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500 mt-1">
              Hold Ctrl or Cmd key to select multiple users
            </p>
          </div>
        )}
        
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">
            Target Stores (Optional)
          </label>
          <select
            name="targetStores"
            multiple
            value={formData.targetStores}
            onChange={handleMultiSelectChange}
            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
          >
            {stores.map(store => (
              <option key={store.id} value={store.id}>
                {store.name} ({store.location})
              </option>
            ))}
          </select>
          <p className="text-sm text-gray-500 mt-1">
            Hold Ctrl or Cmd key to select multiple stores
          </p>
        </div>
        
        <hr className="my-6" />
        
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">
            Action Link (Optional)
          </label>
          <input
            type="text"
            name="actionDestination"
            value={formData.actionDestination || ''}
            onChange={handleChange}
            placeholder="e.g., /inventory/low-stock"
            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">
            Action Button Label
          </label>
          <input
            type="text"
            name="actionLabel"
            value={formData.actionLabel || ''}
            onChange={handleChange}
            placeholder="e.g., View Details"
            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Notification'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateNotification;