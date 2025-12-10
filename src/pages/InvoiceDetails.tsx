import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getInvoiceDetails } from '../lib/invoiceService';
import { CURRENCY, CURRENCY_LOCALE } from '../constants/company.constants';
import { ToastContainer, useToast } from '../components/Toast';

const InvoiceDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [invoiceData, setInvoiceData] = useState<any>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    const loadInvoice = async () => {
      if (!id) {
        navigate('/dashboard');
        return;
      }

      const result = await getInvoiceDetails(id);
      if (result.success && result.data) {
        setInvoiceData(result.data);
      } else {
        setLoadError(true);
        toast.error('Load Failed', 'Failed to load invoice details.');
        setTimeout(() => navigate('/dashboard'), 2000);
      }
      setLoading(false);
    };

    loadInvoice();
  }, [id, navigate]);

  if (loading || loadError) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #0f172a 0%, #020617 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#e5e7eb',
          padding: 20,
        }}
      >
        <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
        {loading ? 'Loading invoice details...' : 'Redirecting to dashboard...'}
      </div>
    );
  }

  if (!invoiceData) {
    return null;
  }

  const { invoice, items } = invoiceData;
  const formatCurrency = (amount: number) => {
    return Number(amount).toLocaleString(CURRENCY_LOCALE, {
      style: 'currency',
      currency: CURRENCY,
      minimumFractionDigits: 0,
    });
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #020617 100%)',
        padding: '40px 20px',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ margin: 0, color: '#e5e7eb', fontSize: 32, fontWeight: 700 }}>
            Invoice Details
          </h1>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              padding: '10px 20px',
              borderRadius: 8,
              border: '1px solid #38bdf8',
              background: 'transparent',
              color: '#38bdf8',
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Back to Dashboard
          </button>
        </div>

        <div
          style={{
            background: 'rgba(15, 23, 42, 0.6)',
            borderRadius: 12,
            border: '1px solid #1e293b',
            padding: 24,
            marginBottom: 24,
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 24 }}>
            <div>
              <div style={{ color: '#9ca3af', fontSize: 12, marginBottom: 8 }}>Invoice Number</div>
              <div style={{ color: '#e5e7eb', fontSize: 18, fontWeight: 600 }}>{invoice.invoice_no}</div>
            </div>
            <div>
              <div style={{ color: '#9ca3af', fontSize: 12, marginBottom: 8 }}>Project Name</div>
              <div style={{ color: '#e5e7eb', fontSize: 18, fontWeight: 600 }}>{invoice.project_name || '-'}</div>
            </div>
            <div>
              <div style={{ color: '#9ca3af', fontSize: 12, marginBottom: 8 }}>Status</div>
              <div
                style={{
                  display: 'inline-block',
                  padding: '4px 12px',
                  borderRadius: 6,
                  fontSize: 14,
                  fontWeight: 500,
                  background:
                    invoice.status === 'paid'
                      ? '#065f46'
                      : invoice.status === 'sent'
                      ? '#1e40af'
                      : '#374151',
                  color: '#e5e7eb',
                }}
              >
                {invoice.status}
              </div>
            </div>
            <div>
              <div style={{ color: '#9ca3af', fontSize: 12, marginBottom: 8 }}>Total Amount</div>
              <div style={{ color: '#34d399', fontSize: 24, fontWeight: 700 }}>
                {formatCurrency(invoice.total)}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 24, marginTop: 24 }}>
            <div>
              <div style={{ color: '#9ca3af', fontSize: 12, marginBottom: 8 }}>Invoice Date</div>
              <div style={{ color: '#e5e7eb', fontSize: 16 }}>{invoice.invoice_date}</div>
            </div>
            <div>
              <div style={{ color: '#9ca3af', fontSize: 12, marginBottom: 8 }}>Due Date</div>
              <div style={{ color: '#e5e7eb', fontSize: 16 }}>{invoice.due_date || '-'}</div>
            </div>
          </div>
        </div>

        <div
          style={{
            background: 'rgba(15, 23, 42, 0.6)',
            borderRadius: 12,
            border: '1px solid #1e293b',
            padding: 24,
            marginBottom: 24,
          }}
        >
          <h2 style={{ margin: '0 0 16px 0', color: '#e5e7eb', fontSize: 20, fontWeight: 600 }}>
            Client Information
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
            <div>
              <div style={{ color: '#9ca3af', fontSize: 12, marginBottom: 4 }}>Name</div>
              <div style={{ color: '#e5e7eb', fontSize: 16 }}>{invoice.clients?.name || '-'}</div>
            </div>
            <div>
              <div style={{ color: '#9ca3af', fontSize: 12, marginBottom: 4 }}>Company</div>
              <div style={{ color: '#e5e7eb', fontSize: 16 }}>{invoice.clients?.company || '-'}</div>
            </div>
            <div>
              <div style={{ color: '#9ca3af', fontSize: 12, marginBottom: 4 }}>Email</div>
              <div style={{ color: '#e5e7eb', fontSize: 16 }}>{invoice.clients?.email || '-'}</div>
            </div>
            <div>
              <div style={{ color: '#9ca3af', fontSize: 12, marginBottom: 4 }}>Phone</div>
              <div style={{ color: '#e5e7eb', fontSize: 16 }}>{invoice.clients?.phone || '-'}</div>
            </div>
            <div>
              <div style={{ color: '#9ca3af', fontSize: 12, marginBottom: 4 }}>Address</div>
              <div style={{ color: '#e5e7eb', fontSize: 16 }}>{invoice.clients?.address || '-'}</div>
            </div>
            <div>
              <div style={{ color: '#9ca3af', fontSize: 12, marginBottom: 4 }}>Site Address</div>
              <div style={{ color: '#e5e7eb', fontSize: 16 }}>{invoice.clients?.site_address || '-'}</div>
            </div>
          </div>
        </div>

        <div
          style={{
            background: 'rgba(15, 23, 42, 0.6)',
            borderRadius: 12,
            border: '1px solid #1e293b',
            padding: 24,
            marginBottom: 24,
          }}
        >
          <h2 style={{ margin: '0 0 16px 0', color: '#e5e7eb', fontSize: 20, fontWeight: 600 }}>
            Invoice Items
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #374151' }}>
                  <th style={{ textAlign: 'left', padding: '12px 8px', color: '#9ca3af', fontSize: 12, fontWeight: 600 }}>
                    Category
                  </th>
                  <th style={{ textAlign: 'left', padding: '12px 8px', color: '#9ca3af', fontSize: 12, fontWeight: 600 }}>
                    Description
                  </th>
                  <th style={{ textAlign: 'left', padding: '12px 8px', color: '#9ca3af', fontSize: 12, fontWeight: 600 }}>
                    Dimensions
                  </th>
                  <th style={{ textAlign: 'right', padding: '12px 8px', color: '#9ca3af', fontSize: 12, fontWeight: 600 }}>
                    Qty
                  </th>
                  <th style={{ textAlign: 'right', padding: '12px 8px', color: '#9ca3af', fontSize: 12, fontWeight: 600 }}>
                    Unit Price
                  </th>
                  <th style={{ textAlign: 'right', padding: '12px 8px', color: '#9ca3af', fontSize: 12, fontWeight: 600 }}>
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item: any) => (
                  <React.Fragment key={item.id}>
                    <tr style={{ borderBottom: '1px solid #1f2937' }}>
                      <td style={{ padding: '12px 8px', color: '#e5e7eb', fontSize: 14 }}>
                        {item.category}
                      </td>
                      <td style={{ padding: '12px 8px', color: '#e5e7eb', fontSize: 14 }}>
                        {item.description}
                      </td>
                      <td style={{ padding: '12px 8px', color: '#e5e7eb', fontSize: 14 }}>
                        {item.dimensions || '-'}
                      </td>
                      <td style={{ padding: '12px 8px', color: '#e5e7eb', fontSize: 14, textAlign: 'right' }}>
                        {item.qty}
                      </td>
                      <td style={{ padding: '12px 8px', color: '#e5e7eb', fontSize: 14, textAlign: 'right' }}>
                        {formatCurrency(item.unit_price)}
                      </td>
                      <td style={{ padding: '12px 8px', color: '#e5e7eb', fontSize: 14, textAlign: 'right', fontWeight: 600 }}>
                        {formatCurrency(item.line_total)}
                      </td>
                    </tr>
                    {item.materials && item.materials.length > 0 && (
                      <tr>
                        <td colSpan={6} style={{ padding: '8px 8px 16px 32px', background: 'rgba(0, 0, 0, 0.2)' }}>
                          <div style={{ color: '#9ca3af', fontSize: 11, marginBottom: 4, fontWeight: 600 }}>Materials:</div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                            {item.materials.map((mat: any, idx: number) => (
                              <div
                                key={idx}
                                style={{
                                  padding: '4px 8px',
                                  background: 'rgba(56, 189, 248, 0.1)',
                                  border: '1px solid rgba(56, 189, 248, 0.3)',
                                  borderRadius: 4,
                                  color: '#38bdf8',
                                  fontSize: 11,
                                }}
                              >
                                {mat.material_name}: {mat.qty_per_item} {mat.unit} (Total: {mat.total_qty} {mat.unit})
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ minWidth: 300 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #374151' }}>
                <span style={{ color: '#9ca3af', fontSize: 14 }}>Subtotal:</span>
                <span style={{ color: '#e5e7eb', fontSize: 14, fontWeight: 600 }}>{formatCurrency(invoice.subtotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #374151' }}>
                <span style={{ color: '#9ca3af', fontSize: 14 }}>Discount:</span>
                <span style={{ color: '#e5e7eb', fontSize: 14, fontWeight: 600 }}>{formatCurrency(invoice.discount)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #374151' }}>
                <span style={{ color: '#9ca3af', fontSize: 14 }}>VAT ({invoice.vat_rate}%):</span>
                <span style={{ color: '#e5e7eb', fontSize: 14, fontWeight: 600 }}>{formatCurrency(invoice.vat_amount)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', marginTop: 8 }}>
                <span style={{ color: '#e5e7eb', fontSize: 18, fontWeight: 700 }}>Total:</span>
                <span style={{ color: '#34d399', fontSize: 20, fontWeight: 700 }}>{formatCurrency(invoice.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {invoice.notes && (
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.6)',
              borderRadius: 12,
              border: '1px solid #1e293b',
              padding: 24,
            }}
          >
            <h2 style={{ margin: '0 0 12px 0', color: '#e5e7eb', fontSize: 20, fontWeight: 600 }}>
              Notes
            </h2>
            <div style={{ color: '#e5e7eb', fontSize: 14, whiteSpace: 'pre-wrap' }}>
              {invoice.notes}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceDetails;
