import React from 'react';

const StatusBadge = ({ status, type = 'rental' }) => {
  if (type === 'availability') {
    const isAvailable = Boolean(status);
    return (
      <span className={`badge ${isAvailable ? 'badge-available' : 'badge-unavailable'}`}>
        <span className="badge-dot"></span>
        {isAvailable ? 'Available Now' : 'Currently Rented'}
      </span>
    );
  }

  const normalized = (status || 'pending').toLowerCase();

  let badgeClass = 'badge-pending';
  let label = status || 'Pending';

  if (normalized === 'approved') {
    badgeClass = 'badge-approved';
    label = 'Approved';
  } else if (normalized === 'rejected') {
    badgeClass = 'badge-rejected';
    label = 'Rejected';
  } else if (normalized === 'returned') {
    badgeClass = 'badge-returned';
    label = 'Returned';
  }

  return (
    <span className={`badge ${badgeClass}`}>
      <span className="badge-dot"></span>
      {label}
    </span>
  );
};

export default StatusBadge;
