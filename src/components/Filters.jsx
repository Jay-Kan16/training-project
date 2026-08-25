import React from 'react';

export default function Filters({ filters, onChange, members = [] }) {
  const update = (key, value) => onChange({ ...filters, [key]: value });

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <select
        value={filters.payer || ''}
        onChange={(e) => update('payer', e.target.value)}
        className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-600 bg-white"
      >
        <option value="">All payers</option>
        {members.map((m) => (
          <option key={m._id} value={m._id}>
            {m.name}
          </option>
        ))}
      </select>

      <input
        type="date"
        value={filters.startDate || ''}
        onChange={(e) => update('startDate', e.target.value)}
        className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-600"
      />
      <span className="self-center text-gray-400 text-sm">to</span>
      <input
        type="date"
        value={filters.endDate || ''}
        onChange={(e) => update('endDate', e.target.value)}
        className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-600"
      />

      {(filters.payer || filters.startDate || filters.endDate) && (
        <button
          onClick={() => onChange({})}
          className="text-primary-600 hover:underline text-xs self-center"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
