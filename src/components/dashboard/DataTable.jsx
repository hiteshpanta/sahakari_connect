import React from 'react';

export default function DataTable({
  columns,
  rows,
  rowKey = '_id',
  onRowClick,
  empty,
  emptyIcon,
  emptyTitle,
  minWidth = 640,
}) {
  const isEmpty = !rows || rows.length === 0;

  return (
    <div className="table-container" style={{ minWidth }}>
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isEmpty ? (
            <tr>
              <td colSpan={columns.length}>
                {empty || (
                  <div className="empty-state">
                    {emptyIcon && (
                      <div className="empty-state-icon">{emptyIcon}</div>
                    )}
                    <h3>{emptyTitle || 'No data yet'}</h3>
                  </div>
                )}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr
                key={row[rowKey]}
                style={onRowClick ? { cursor: 'pointer' } : undefined}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    style={col.style}
                    className={col.className}
                  >
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
