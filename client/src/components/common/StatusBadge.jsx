const statusColors = {
  new: 'bg-blue-100 text-blue-800',
  received_at_reception: 'bg-blue-100 text-blue-800',
  forwarded: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  assigned_to_counsellor: 'bg-purple-100 text-purple-800',
  counselling_in_progress: 'bg-purple-100 text-purple-800',
  follow_up_required: 'bg-orange-100 text-orange-800',
  forwarded_to_department: 'bg-indigo-100 text-indigo-800',
  department_reviewed: 'bg-indigo-100 text-indigo-800',
  forwarded_to_accounts: 'bg-cyan-100 text-cyan-800',
  fee_pending: 'bg-orange-100 text-orange-800',
  fee_partially_paid: 'bg-yellow-100 text-yellow-800',
  fee_completed: 'bg-green-100 text-green-800',
  forwarded_to_registrar: 'bg-teal-100 text-teal-800',
  document_verification: 'bg-teal-100 text-teal-800',
  pending_documents: 'bg-orange-100 text-orange-800',
  under_verification: 'bg-yellow-100 text-yellow-800',
  verified: 'bg-green-100 text-green-800',
  admission_approved: 'bg-green-100 text-green-800',
  admission_rejected: 'bg-red-100 text-red-800',
  admission_cancelled: 'bg-red-100 text-red-800',
  admitted: 'bg-green-100 text-green-800',
  completed: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800',
  reopened: 'bg-yellow-100 text-yellow-800',
  soft_deleted: 'bg-red-100 text-red-800',
  converted_to_admission: 'bg-indigo-100 text-indigo-800',
  visit_completed: 'bg-green-100 text-green-800',
  event_scheduled: 'bg-purple-100 text-purple-800',
  event_completed: 'bg-green-100 text-green-800',
  not_interested: 'bg-gray-100 text-gray-800',
  course_discussed: 'bg-blue-100 text-blue-800',
  interested_in_admission: 'bg-indigo-100 text-indigo-800',
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  paid: 'bg-green-100 text-green-800',
  unpaid: 'bg-red-100 text-red-800',
  partially_paid: 'bg-yellow-100 text-yellow-800',
  cancelled: 'bg-red-100 text-red-800',
  refunded: 'bg-orange-100 text-orange-800',
};

export default function StatusBadge({ status }) {
  const color = statusColors[status] || 'bg-gray-100 text-gray-800';
  const label = (status || '').replace(/_/g, ' ');
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${color}`}>
      {label}
    </span>
  );
}
