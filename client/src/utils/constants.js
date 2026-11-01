// Provider Dashboard nav items — used by DashboardLayout/Sidebar
export const PROVIDER_NAV = [
  { label: 'Dashboard',   path: '/provider/dashboard',  icon: 'LayoutDashboard' },
  { label: 'My Services', path: '/provider/services',   icon: 'Wrench' },
  { label: 'Bookings',    path: '/provider/bookings',   icon: 'CalendarDays' },
  { label: 'Reviews',     path: '/provider/reviews',    icon: 'Star' },
  { label: 'Earnings',    path: '/provider/earnings',   icon: 'DollarSign' },
  { label: 'Profile',     path: '/provider/profile',    icon: 'User' },
  { label: 'Settings',    path: '/provider/settings',   icon: 'Settings' },
];

// Customer Dashboard nav items
export const CUSTOMER_NAV = [
  { label: 'Dashboard',        path: '/dashboard',        icon: 'LayoutDashboard' },
  { label: 'My Bookings',      path: '/my-bookings',      icon: 'CalendarDays' },
  { label: 'Saved Providers',  path: '/saved-providers',  icon: 'Heart' },
  { label: 'Messages',         path: '/messages',         icon: 'MessageSquare' },
  { label: 'Reviews',          path: '/reviews',          icon: 'Star' },
  { label: 'Profile',          path: '/profile',          icon: 'User' },
  { label: 'Settings',         path: '/settings',         icon: 'Settings' },
];

// Admin Dashboard nav items
export const ADMIN_NAV = [
  { label: 'Dashboard',          path: '/admin',                 icon: 'LayoutDashboard' },
  { label: 'Users',              path: '/admin/users',           icon: 'Users' },
  { label: 'Providers',          path: '/admin/providers',       icon: 'Briefcase' },
  { label: 'Services',           path: '/admin/services',        icon: 'Wrench' },
  { label: 'Flagged Activities', path: '/admin/flagged',         icon: 'Flag' },
  { label: 'Reports',            path: '/admin/reports',         icon: 'BarChart2' },
  { label: 'Settings',           path: '/admin/settings',        icon: 'Settings' },
];

// Booking status config
export const BOOKING_STATUS = {
  pending:     { label: 'Pending',     color: 'yellow' },
  accepted:    { label: 'Accepted',    color: 'blue'   },
  in_progress: { label: 'In Progress', color: 'blue'   },
  completed:   { label: 'Completed',   color: 'green'  },
  cancelled:   { label: 'Cancelled',   color: 'red'    },
};

// Service categories
export const SERVICE_CATEGORIES = [
  'Home Services',
  'Tech Services',
  'Vehicle Services',
  'Student Services',
  'Creative Services',
  'Other',
];
