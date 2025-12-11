import React, { useState, useMemo } from 'react';
import type { MaterialBreakdown } from '../../types/dashboard.types';
import type { Invoice } from '../../types/invoice.types';
import { CURRENCY, CURRENCY_LOCALE } from '../../constants/company.constants';
import { escapeCSV, downloadCSV } from '../../utils/export.utils';
import { AnalyticsService } from '../../services/analytics.service';

interface MaterialBreakdownTableProps {
  materials: MaterialBreakdown[];
  invoices: Invoice[];
  selectedInvoiceIds: string[];
  onInvoiceSelect: (invoiceIds: string[]) => void;
}

export const MaterialBreakdownTable: React.FC<MaterialBreakdownTableProps> = ({
  materials,
  invoices,
  selectedInvoiceIds,
  onInvoiceSelect,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [exporting, setExporting] = useState(false);

  const totalCost = materials.reduce((sum, m) => sum + m.total_cost, 0);

  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      const matchesSearch =
        !searchTerm ||
        invoice.invoice_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.clients?.name?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDateFrom = !dateFrom || invoice.invoice_date >= dateFrom;
      const matchesDateTo = !dateTo || invoice.invoice_date <= dateTo;

      return matchesSearch && matchesDateFrom && matchesDateTo;
    });
  }, [invoices, searchTerm, dateFrom, dateTo]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onInvoiceSelect(filteredInvoices.map((inv) => inv.id));
    } else {
      onInvoiceSelect([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      onInvoiceSelect([...selectedInvoiceIds, id]);
    } else {
      onInvoiceSelect(selectedInvoiceIds.filter((i) => i !== id));
    }
  };

  const handleExportDetailed = async () => {
    const idsToExport = selectedInvoiceIds.length > 0 ? selectedInvoiceIds : filteredInvoices.map((inv) => inv.id);

    if (idsToExport.length === 0) {
      alert('No invoices selected for export');
      return;
    }

    setExporting(true);
    try {
      const detailedData = await AnalyticsService.getDetailedMaterialsForInvoices(idsToExport);

      if (detailedData.length === 0) {
        alert('No material data found for selected invoices');
        return;
      }

      const lines: string[] = [];
      lines.push(
        ['Date', 'Customer Name', 'Invoice No', 'Item Name', 'Description', 'Material', 'Unit', 'Quantity', 'Unit Cost', 'Total Cost']
          .map(escapeCSV)
          .join(',')
      );

      detailedData.forEach((row) => {
        lines.push(
          [
            row.date,
            row.customerName,
            row.invoiceNo,
            row.itemName,
            row.description,
            row.materialName,
            row.unit,
            Number(row.totalQty).toFixed(2),
            Number(row.unitCost).toFixed(2),
            Number(row.totalCost).toFixed(2),
          ]
            .map(escapeCSV)
            .join(',')
        );
      });

      const csvContent = lines.join('\r\n');
      const filename = `material-breakdown-detailed-${new Date().toISOString().split('T')[0]}.csv`;
      downloadCSV(filename, csvContent);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export data');
    } finally {
      setExporting(false);
    }
  };

  const allSelected =
    filteredInvoices.length > 0 && filteredInvoices.every((inv) => selectedInvoiceIds.includes(inv.id));
  const someSelected = filteredInvoices.some((inv) => selectedInvoiceIds.includes(inv.id));

  return (
    <div style={{ padding: '16px 0' }}>
      <div style={{ marginBottom: 16, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <label style={{ display: 'block', color: '#9ca3af', fontSize: 12, marginBottom: 4 }}>
            Search (Invoice No., Customer Name)
          </label>
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              background: '#1f2937',
              border: '1px solid #374151',
              borderRadius: 6,
              color: '#e5e7eb',
              fontSize: 14,
            }}
          />
        </div>
        <div>
          <label style={{ display: 'block', color: '#9ca3af', fontSize: 12, marginBottom: 4 }}>Date From</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            style={{
              padding: '8px 12px',
              background: '#1f2937',
              border: '1px solid #374151',
              borderRadius: 6,
              color: '#e5e7eb',
              fontSize: 14,
            }}
          />
        </div>
        <div>
          <label style={{ display: 'block', color: '#9ca3af', fontSize: 12, marginBottom: 4 }}>Date To</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            style={{
              padding: '8px 12px',
              background: '#1f2937',
              border: '1px solid #374151',
              borderRadius: 6,
              color: '#e5e7eb',
              fontSize: 14,
            }}
          />
        </div>
        {(searchTerm || dateFrom || dateTo) && (
          <button
            onClick={() => {
              setSearchTerm('');
              setDateFrom('');
              setDateTo('');
            }}
            style={{
              padding: '8px 16px',
              background: '#374151',
              border: 'none',
              borderRadius: 6,
              color: '#e5e7eb',
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            Clear Filters
          </button>
        )}
        <button
          onClick={handleExportDetailed}
          disabled={filteredInvoices.length === 0 || exporting}
          style={{
            marginLeft: 'auto',
            padding: '8px 16px',
            background:
              filteredInvoices.length === 0 || exporting
                ? '#374151'
                : 'linear-gradient(135deg, #065f46 0%, #047857 100%)',
            border: 'none',
            borderRadius: 6,
            color: '#fff',
            fontSize: 13,
            fontWeight: 500,
            cursor: filteredInvoices.length === 0 || exporting ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          {exporting ? 'Exporting...' : `Export ${selectedInvoiceIds.length > 0 ? `(${selectedInvoiceIds.length})` : 'All'}`}
        </button>
      </div>

      {selectedInvoiceIds.length > 0 && (
        <div
          style={{
            marginBottom: 12,
            padding: '8px 12px',
            background: 'rgba(56, 189, 248, 0.1)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            borderRadius: 6,
            color: '#38bdf8',
            fontSize: 13,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>{selectedInvoiceIds.length} invoice(s) selected</span>
          <button
            onClick={() => onInvoiceSelect([])}
            style={{
              padding: '4px 12px',
              background: 'transparent',
              border: '1px solid #38bdf8',
              borderRadius: 4,
              color: '#38bdf8',
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            Clear Selection
          </button>
        </div>
      )}

      <div style={{ maxHeight: 400, overflowY: 'auto', marginBottom: 16 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #374151' }}>
              <th style={{ textAlign: 'left', padding: '8px', color: '#9ca3af', fontSize: 12, width: 40 }}>
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(input) => {
                    if (input) input.indeterminate = someSelected && !allSelected;
                  }}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  style={{ cursor: 'pointer' }}
                />
              </th>
              <th style={{ textAlign: 'left', padding: '8px 0', color: '#9ca3af', fontSize: 12 }}>Invoice No</th>
              <th style={{ textAlign: 'left', padding: '8px 0', color: '#9ca3af', fontSize: 12 }}>Customer</th>
              <th style={{ textAlign: 'right', padding: '8px 0', color: '#9ca3af', fontSize: 12 }}>Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: 20, textAlign: 'center', color: '#6b7280' }}>
                  No invoices found
                </td>
              </tr>
            ) : (
              filteredInvoices.map((invoice) => (
                <tr key={invoice.id} style={{ borderBottom: '1px solid #1f2937' }}>
                  <td style={{ padding: '8px' }}>
                    <input
                      type="checkbox"
                      checked={selectedInvoiceIds.includes(invoice.id)}
                      onChange={(e) => handleSelectOne(invoice.id, e.target.checked)}
                      style={{ cursor: 'pointer' }}
                    />
                  </td>
                  <td style={{ padding: '8px 0', color: '#e5e7eb', fontSize: 13 }}>{invoice.invoice_no}</td>
                  <td style={{ padding: '8px 0', color: '#e5e7eb', fontSize: 13 }}>{invoice.clients?.name || '-'}</td>
                  <td style={{ padding: '8px 0', color: '#e5e7eb', fontSize: 13, textAlign: 'right' }}>
                    {invoice.invoice_date}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {materials.length > 0 && selectedInvoiceIds.length > 0 && (
        <>
          <h4 style={{ color: '#e5e7eb', fontSize: 14, marginBottom: 8 }}>Material Summary</h4>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #374151' }}>
                <th style={{ textAlign: 'left', padding: '8px 0', color: '#9ca3af', fontSize: 12 }}>Material</th>
                <th style={{ textAlign: 'right', padding: '8px 0', color: '#9ca3af', fontSize: 12 }}>Total Quantity</th>
                <th style={{ textAlign: 'right', padding: '8px 0', color: '#9ca3af', fontSize: 12 }}>Unit</th>
                <th style={{ textAlign: 'right', padding: '8px 0', color: '#9ca3af', fontSize: 12 }}>Unit Cost</th>
                <th style={{ textAlign: 'right', padding: '8px 0', color: '#9ca3af', fontSize: 12 }}>Total Cost</th>
                <th style={{ textAlign: 'right', padding: '8px 0', color: '#9ca3af', fontSize: 12 }}>Used In</th>
              </tr>
            </thead>
            <tbody>
              {materials.map((material, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #1f2937' }}>
                  <td style={{ padding: '12px 0', color: '#e5e7eb', fontSize: 14 }}>{material.material_name}</td>
                  <td style={{ padding: '12px 0', color: '#e5e7eb', fontSize: 14, textAlign: 'right' }}>
                    {material.total_qty.toFixed(2)}
                  </td>
                  <td style={{ padding: '12px 0', color: '#e5e7eb', fontSize: 14, textAlign: 'right' }}>{material.unit}</td>
                  <td style={{ padding: '12px 0', color: '#e5e7eb', fontSize: 14, textAlign: 'right' }}>
                    {material.unit_cost.toLocaleString(CURRENCY_LOCALE, {
                      style: 'currency',
                      currency: CURRENCY,
                      minimumFractionDigits: 0,
                    })}
                  </td>
                  <td style={{ padding: '12px 0', color: '#38bdf8', fontSize: 14, textAlign: 'right', fontWeight: 500 }}>
                    {material.total_cost.toLocaleString(CURRENCY_LOCALE, {
                      style: 'currency',
                      currency: CURRENCY,
                      minimumFractionDigits: 0,
                    })}
                  </td>
                  <td style={{ padding: '12px 0', color: '#e5e7eb', fontSize: 14, textAlign: 'right' }}>
                    {material.usage_count} items
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ borderTop: '2px solid #374151', background: 'rgba(6, 95, 70, 0.15)' }}>
                <td style={{ padding: '14px 0', color: '#e5e7eb', fontSize: 15, fontWeight: 700 }}>TOTAL</td>
                <td style={{ padding: '14px 0' }}></td>
                <td style={{ padding: '14px 0' }}></td>
                <td style={{ padding: '14px 0' }}></td>
                <td style={{ padding: '14px 0', color: '#34d399', fontSize: 16, textAlign: 'right', fontWeight: 700 }}>
                  {totalCost.toLocaleString(CURRENCY_LOCALE, {
                    style: 'currency',
                    currency: CURRENCY,
                    minimumFractionDigits: 0,
                  })}
                </td>
                <td style={{ padding: '14px 0' }}></td>
              </tr>
            </tfoot>
          </table>
        </>
      )}

      {selectedInvoiceIds.length === 0 && (
        <div style={{ textAlign: 'center', padding: '20px 0', color: '#6b7280' }}>
          Select invoices to view material breakdown summary
        </div>
      )}
    </div>
  );
};
