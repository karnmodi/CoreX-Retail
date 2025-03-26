export const getFullName = (firstName, lastName) => {
    if (!firstName || !lastName) return 'N/A';
    return `${firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase()} ${lastName.charAt(0).toUpperCase() + lastName.slice(1).toLowerCase()}`.trim();
  };
  
  export const getRoleBadgeColor = (role) => {
    const roleColors = {
      'store manager': 'bg-blue-100 text-blue-800',
      'admin': 'bg-purple-100 text-purple-800',
      'staff': 'bg-green-100 text-green-800',
    };
    return roleColors[role?.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };
  
  export const getStatusColor = (employeeStatus) => {
    const statusColors = {
      'active': 'bg-green-100 text-green-800',
      'leave of absence': 'bg-blue-100 text-blue-800',
      'terminated for cause': 'bg-red-100 text-red-800',
      'voluntarily terminated': 'bg-yellow-100 text-yellow-800',
    };
    return statusColors[employeeStatus?.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };
  