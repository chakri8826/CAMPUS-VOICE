import React, { useState } from 'react';

const SearchFilter = ({ onSearch, onFilter, onReset }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    status: '',
    priority: '',
    department: '',
    dateRange: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  const categories = [
    'Infrastructure',
    'Academic',
    'Hostel',
    'Transportation',
    'Food',
    'Security',
    'Technology',
    'Sports',
    'Library',
    'Other'
  ];

  const statuses = [
    'pending',
    'in_progress',
    'resolved',
    'rejected',
    'closed'
  ];

  const priorities = [
    'low',
    'medium',
    'high',
    'urgent'
  ];

  const departments = [
    'Computer Science',
    'Electrical Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Chemical Engineering',
    'Other'
  ];

  const dateRanges = [
    { value: '', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'year', label: 'This Year' }
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilter(newFilters);
  };

  const handleReset = () => {
    setSearchTerm('');
    setFilters({
      category: '',
      status: '',
      priority: '',
      department: '',
      dateRange: ''
    });
    onReset();
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-500',
      in_progress: 'bg-blue-500',
      resolved: 'bg-green-500',
      rejected: 'bg-red-500',
      closed: 'bg-gray-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-green-500',
      medium: 'bg-yellow-500',
      high: 'bg-orange-500',
      urgent: 'bg-red-500'
    };
    return colors[priority] || 'bg-gray-500';
  };

  const activeFiltersCount = Object.values(filters).filter(value => value !== '').length;

  return (
    <div className="bg-[#214a3c] rounded-lg p-4 space-y-4">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search complaints by title, description, or tags..."
            className="w-full px-4 py-2 pl-10 bg-[#10231c] border border-[#214a3c] rounded-lg text-white placeholder-[#8ecdb7] focus:outline-none focus:border-[#019863]"
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8ecdb7]">
            🔍
          </div>
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-[#019863] text-white rounded-lg hover:bg-[#017a4f] transition-colors"
        >
          Search
        </button>
      </form>

      {/* Filter Toggle */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 text-[#8ecdb7] hover:text-white transition-colors"
        >
          <span>Filters</span>
          {activeFiltersCount > 0 && (
            <span className="bg-[#019863] text-white text-xs px-2 py-1 rounded-full">
              {activeFiltersCount}
            </span>
          )}
          <span className={`transform transition-transform ${showFilters ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </button>
        
        {activeFiltersCount > 0 && (
          <button
            onClick={handleReset}
            className="text-[#8ecdb7] hover:text-white transition-colors text-sm"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-[#214a3c]">
          {/* Category Filter */}
          <div>
            <label className="block text-[#8ecdb7] text-sm font-medium mb-2">Category</label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full px-3 py-2 bg-[#10231c] border border-[#214a3c] rounded-lg text-white focus:outline-none focus:border-[#019863]"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-[#8ecdb7] text-sm font-medium mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 bg-[#10231c] border border-[#214a3c] rounded-lg text-white focus:outline-none focus:border-[#019863]"
            >
              <option value="">All Statuses</option>
              {statuses.map(status => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="block text-[#8ecdb7] text-sm font-medium mb-2">Priority</label>
            <select
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
              className="w-full px-3 py-2 bg-[#10231c] border border-[#214a3c] rounded-lg text-white focus:outline-none focus:border-[#019863]"
            >
              <option value="">All Priorities</option>
              {priorities.map(priority => (
                <option key={priority} value={priority}>
                  {priority.charAt(0).toUpperCase() + priority.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Department Filter */}
          <div>
            <label className="block text-[#8ecdb7] text-sm font-medium mb-2">Department</label>
            <select
              value={filters.department}
              onChange={(e) => handleFilterChange('department', e.target.value)}
              className="w-full px-3 py-2 bg-[#10231c] border border-[#214a3c] rounded-lg text-white focus:outline-none focus:border-[#019863]"
            >
              <option value="">All Departments</option>
              {departments.map(department => (
                <option key={department} value={department}>{department}</option>
              ))}
            </select>
          </div>

          {/* Date Range Filter */}
          <div>
            <label className="block text-[#8ecdb7] text-sm font-medium mb-2">Date Range</label>
            <select
              value={filters.dateRange}
              onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              className="w-full px-3 py-2 bg-[#10231c] border border-[#214a3c] rounded-lg text-white focus:outline-none focus:border-[#019863]"
            >
              {dateRanges.map(range => (
                <option key={range.value} value={range.value}>{range.label}</option>
              ))}
            </select>
          </div>

          {/* Quick Filter Buttons */}
          <div className="flex flex-col gap-2">
            <label className="block text-[#8ecdb7] text-sm font-medium mb-2">Quick Filters</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleFilterChange('status', 'pending')}
                className="px-3 py-1 bg-yellow-500 text-white text-xs rounded-full hover:bg-yellow-600 transition-colors"
              >
                Pending
              </button>
              <button
                onClick={() => handleFilterChange('status', 'resolved')}
                className="px-3 py-1 bg-green-500 text-white text-xs rounded-full hover:bg-green-600 transition-colors"
              >
                Resolved
              </button>
              <button
                onClick={() => handleFilterChange('priority', 'urgent')}
                className="px-3 py-1 bg-red-500 text-white text-xs rounded-full hover:bg-red-600 transition-colors"
              >
                Urgent
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2 pt-2 border-t border-[#214a3c]">
          {filters.category && (
            <span className="px-3 py-1 bg-[#019863] text-white text-xs rounded-full">
              Category: {filters.category} ✕
            </span>
          )}
          {filters.status && (
            <span className="px-3 py-1 bg-[#019863] text-white text-xs rounded-full">
              Status: {filters.status} ✕
            </span>
          )}
          {filters.priority && (
            <span className="px-3 py-1 bg-[#019863] text-white text-xs rounded-full">
              Priority: {filters.priority} ✕
            </span>
          )}
          {filters.department && (
            <span className="px-3 py-1 bg-[#019863] text-white text-xs rounded-full">
              Department: {filters.department} ✕
            </span>
          )}
          {filters.dateRange && (
            <span className="px-3 py-1 bg-[#019863] text-white text-xs rounded-full">
              Date: {dateRanges.find(r => r.value === filters.dateRange)?.label} ✕
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchFilter; 