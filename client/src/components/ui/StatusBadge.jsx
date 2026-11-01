const STATUS_STYLES = {
  pending:     'bg-yellow-100 text-yellow-700 border-yellow-200',
  accepted:    'bg-blue-100   text-blue-700   border-blue-200',
  in_progress: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  completed:   'bg-green-100  text-green-700  border-green-200',
  cancelled:   'bg-red-100    text-red-700    border-red-200',
  scheduled:   'bg-purple-100 text-purple-700 border-purple-200',
};

const STATUS_LABELS = {
  pending:     'Pending',
  accepted:    'Accepted',
  in_progress: 'In Progress',
  completed:   'Completed',
  cancelled:   'Cancelled',
  scheduled:   'Scheduled',
};

const StatusBadge = ({ status }) => {
  const key = status?.toLowerCase().replace(' ', '_');
  const styles = STATUS_STYLES[key] || 'bg-gray-100 text-gray-600 border-gray-200';
  const label  = STATUS_LABELS[key] || status;

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${styles}`}>
      {label}
    </span>
  );
};

export default StatusBadge;
