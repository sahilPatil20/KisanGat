import React from 'react';
import { Box } from '@mui/material';

const STATUS_STYLES = {
  PAID:     { bg: '#ECFDF5', color: '#047857', dot: '#059669', label: 'Paid' },
  PARTIAL:  { bg: '#FFFBEB', color: '#92400E', dot: '#D97706', label: 'Partial' },
  DUE:      { bg: '#FFF1F2', color: '#BE123C', dot: '#E11D48', label: 'Due' },
  ACTIVE:   { bg: '#ECFDF5', color: '#047857', dot: '#059669', label: 'Active' },
  INACTIVE: { bg: '#F1F5F9', color: '#475569', dot: '#94A3B8', label: 'Inactive' },
  PENDING:  { bg: '#FFFBEB', color: '#92400E', dot: '#D97706', label: 'Pending' },
  UNPAID:   { bg: '#FFF1F2', color: '#BE123C', dot: '#E11D48', label: 'Unpaid' },
  CASH:     { bg: '#F1F5F9', color: '#475569', dot: '#94A3B8', label: 'Cash' },
  UPI:      { bg: '#ECFDF5', color: '#047857', dot: '#059669', label: 'UPI' },
  BANK_TRANSFER: { bg: '#EFF6FF', color: '#1D4ED8', dot: '#2563EB', label: 'Bank Transfer' },
  RETAIL:   { bg: '#EFF6FF', color: '#1D4ED8', dot: '#2563EB', label: 'Retail' },
  WHOLESALE:{ bg: '#FFFBEB', color: '#92400E', dot: '#D97706', label: 'Wholesale' },
  HOTEL:    { bg: '#FDF4FF', color: '#86198F', dot: '#C026D3', label: 'Hotel' },
  SHOP:     { bg: '#ECFDF5', color: '#047857', dot: '#059669', label: 'Shop' },
  MORNING:  { bg: '#FFFBEB', color: '#D97706', dot: '#F59E0B', label: 'Morning' },
  EVENING:  { bg: '#EEF2FF', color: '#4F46E5', dot: '#6366F1', label: 'Evening' },
  COW:      { bg: '#EFF6FF', color: '#2563EB', dot: '#3B82F6', label: 'Cow' },
  BUFFALO:  { bg: '#F5F3FF', color: '#7C3AED', dot: '#8B5CF6', label: 'Buffalo' },
  COLLECTION:{ bg: '#EFF6FF', color: '#2563EB', dot: '#3B82F6', label: 'Collection' },
  PAYMENT:   { bg: '#FFF1F2', color: '#E11D48', dot: '#F43F5E', label: 'Payment' }
};

export default function StatusBadge({ status }) {
  const normalizedStatus = typeof status === 'string' ? status.replace(/_/g, ' ').toUpperCase() : '';
  const s = STATUS_STYLES[normalizedStatus?.replace(/ /g, '_')] || { bg: '#F1F5F9', color: '#475569', dot: '#94A3B8', label: status };
  return (
    <Box sx={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      px: '10px', py: '3px', borderRadius: '100px',
      bgcolor: s.bg, color: s.color,
      fontSize: '11px', fontWeight: 700, whiteSpace: 'nowrap'
    }}>
      <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: s.dot, flexShrink: 0 }} />
      {s.label}
    </Box>
  );
}
