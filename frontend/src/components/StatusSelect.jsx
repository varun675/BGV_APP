import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { CheckCircle2, XCircle, AlertTriangle, HelpCircle } from 'lucide-react';

const statusOptions = [
  { value: 'verified', label: 'Verified', color: 'bg-green-500', icon: CheckCircle2 },
  { value: 'major', label: 'Major Discrepancy', color: 'bg-red-500', icon: XCircle },
  { value: 'minor', label: 'Minor Discrepancy', color: 'bg-yellow-500', icon: AlertTriangle },
  { value: 'unable', label: 'Unable to Verify', color: 'bg-gray-500', icon: HelpCircle },
];

export const StatusSelect = ({ value, onChange, label }) => {
  const selectedOption = statusOptions.find(opt => opt.value === value);
  
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-foreground mb-2">
          {label}
        </label>
      )}
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger data-testid="status-select-trigger" className="w-full">
          <SelectValue placeholder="Select verification status">
            {selectedOption && (
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${selectedOption.color}`} />
                <span>{selectedOption.label}</span>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map((option) => {
            const Icon = option.icon;
            return (
              <SelectItem 
                key={option.value} 
                value={option.value}
                data-testid={`status-option-${option.value}`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${option.color}`} />
                  <span>{option.label}</span>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
};

export const StatusBadge = ({ status }) => {
  const option = statusOptions.find(opt => opt.value === status) || statusOptions[0];
  const Icon = option.icon;
  
  const colorClasses = {
    verified: 'bg-green-100 text-green-700 border-green-200',
    major: 'bg-red-100 text-red-700 border-red-200',
    minor: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    unable: 'bg-gray-100 text-gray-700 border-gray-200',
  };
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${colorClasses[status]}`}>
      <Icon className="w-3 h-3" />
      {option.label}
    </span>
  );
};

export default StatusSelect;
