import React from 'react';

function ExportButton({ data, filename, label }) {
  const exportToCSV = () => {
    if (data.length === 0) {
      alert('No data to export');
      return;
    }

    // Get headers from first object
    const headers = Object.keys(data[0]).join(',');

    // Convert rows
    const rows = data.map(row =>
      Object.values(row)
        .map(value => {
          if (value === null || value === undefined) return '';
          const escaped = ('' + value).replace(/"/g, '""');
          return `"${escaped}"`;
        })
        .join(',')
    );

    const csvContent = [headers, ...rows].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button
      onClick={exportToCSV}
      style={{
        padding: '10px 20px',
        background: '#4caf50',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '14px',
        cursor: 'pointer',
        marginLeft: '12px',
      }}
    >
      📄 {label}
    </button>
  );
}

export default ExportButton;