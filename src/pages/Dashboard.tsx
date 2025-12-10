import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

type AnalyticsSummary = {
  totalInvoices: number;
  totalRevenue: number;
  avgInvoiceValue: number;
  totalItemsSold: number;
  draftCount: number;
  paidCount: number;
  sentCount: number;
};

type TimeSeriesData = {
  period: string;
  invoiceCount: number;
  revenue: number;
};

type CategoryData = {
  category: string;
  itemCount: number;
  revenue: number;
};

type MaterialBreakdown = {
  material_name: string;
  total_qty: number;
  unit: string;
  usage_count: number;
};

type TopClient = {
  client_name: string;
  invoice_count: number;
  total_revenue: number;
};

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [timeSeries, setTimeSeries] = useState<TimeSeriesData[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [materialBreakdown, setMaterialBreakdown] = useState<MaterialBreakdown[]>([]);
  const [topClients, setTopClients] = useState<TopClient[]>([]);
  const [timeRange, setTimeRange] = useState<'7days' | '30days' | '90days' | 'all'>('30days');

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadSummary(),
        loadTimeSeries(),
        loadCategoryData(),
        loadMaterialBreakdown(),
        loadTopClients(),
      ]);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDateFilter = () => {
    const now = new Date();
    switch (timeRange) {
      case '7days':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      case '30days':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
      case '90days':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();
      default:
        return null;
    }
  };

  const loadSummary = async () => {
    const dateFilter = getDateFilter();

    let invoicesQuery = supabase.from('invoices').select('total, status');
    if (dateFilter) {
      invoicesQuery = invoicesQuery.gte('invoice_date', dateFilter);
    }

    const { data: invoices } = await invoicesQuery;

    let itemsQuery = supabase.from('invoice_items').select('qty, invoice_id');
    if (dateFilter) {
      const { data: filteredInvoices } = await supabase
        .from('invoices')
        .select('id')
        .gte('invoice_date', dateFilter);

      const invoiceIds = filteredInvoices?.map(inv => inv.id) || [];
      if (invoiceIds.length > 0) {
        itemsQuery = itemsQuery.in('invoice_id', invoiceIds);
      }
    }

    const { data: items } = await itemsQuery;

    const totalRevenue = invoices?.reduce((sum, inv) => sum + Number(inv.total), 0) || 0;
    const totalInvoices = invoices?.length || 0;
    const totalItemsSold = items?.reduce((sum, item) => sum + Number(item.qty), 0) || 0;

    const draftCount = invoices?.filter(inv => inv.status === 'draft').length || 0;
    const paidCount = invoices?.filter(inv => inv.status === 'paid').length || 0;
    const sentCount = invoices?.filter(inv => inv.status === 'sent').length || 0;

    setSummary({
      totalInvoices,
      totalRevenue,
      avgInvoiceValue: totalInvoices > 0 ? totalRevenue / totalInvoices : 0,
      totalItemsSold,
      draftCount,
      paidCount,
      sentCount,
    });
  };

  const loadTimeSeries = async () => {
    const dateFilter = getDateFilter();

    let query = supabase
      .from('invoices')
      .select('invoice_date, total');

    if (dateFilter) {
      query = query.gte('invoice_date', dateFilter);
    }

    const { data } = await query.order('invoice_date', { ascending: true });

    if (!data) {
      setTimeSeries([]);
      return;
    }

    const grouped = data.reduce((acc, invoice) => {
      const date = invoice.invoice_date;
      if (!acc[date]) {
        acc[date] = { period: date, invoiceCount: 0, revenue: 0 };
      }
      acc[date].invoiceCount += 1;
      acc[date].revenue += Number(invoice.total);
      return acc;
    }, {} as Record<string, TimeSeriesData>);

    setTimeSeries(Object.values(grouped));
  };

  const loadCategoryData = async () => {
    const dateFilter = getDateFilter();

    let query = supabase
      .from('invoice_items')
      .select('category, qty, unit_price, invoice_id');

    if (dateFilter) {
      const { data: filteredInvoices } = await supabase
        .from('invoices')
        .select('id')
        .gte('invoice_date', dateFilter);

      const invoiceIds = filteredInvoices?.map(inv => inv.id) || [];
      if (invoiceIds.length > 0) {
        query = query.in('invoice_id', invoiceIds);
      }
    }

    const { data } = await query;

    if (!data) {
      setCategoryData([]);
      return;
    }

    const grouped = data.reduce((acc, item) => {
      const cat = item.category || 'Uncategorized';
      if (!acc[cat]) {
        acc[cat] = { category: cat, itemCount: 0, revenue: 0 };
      }
      acc[cat].itemCount += Number(item.qty);
      acc[cat].revenue += Number(item.qty) * Number(item.unit_price);
      return acc;
    }, {} as Record<string, CategoryData>);

    setCategoryData(Object.values(grouped).sort((a, b) => b.revenue - a.revenue));
  };

  const loadMaterialBreakdown = async () => {
    const dateFilter = getDateFilter();

    let query = supabase
      .from('item_materials')
      .select('material_name, unit, total_qty, invoice_item_id');

    if (dateFilter) {
      const { data: filteredInvoices } = await supabase
        .from('invoices')
        .select('id')
        .gte('invoice_date', dateFilter);

      const invoiceIds = filteredInvoices?.map(inv => inv.id) || [];

      if (invoiceIds.length > 0) {
        const { data: items } = await supabase
          .from('invoice_items')
          .select('id')
          .in('invoice_id', invoiceIds);

        const itemIds = items?.map(item => item.id) || [];
        if (itemIds.length > 0) {
          query = query.in('invoice_item_id', itemIds);
        }
      }
    }

    const { data } = await query;

    if (!data) {
      setMaterialBreakdown([]);
      return;
    }

    const grouped = data.reduce((acc, mat) => {
      const key = `${mat.material_name}_${mat.unit}`;
      if (!acc[key]) {
        acc[key] = {
          material_name: mat.material_name,
          unit: mat.unit,
          total_qty: 0,
          usage_count: 0,
        };
      }
      acc[key].total_qty += Number(mat.total_qty);
      acc[key].usage_count += 1;
      return acc;
    }, {} as Record<string, MaterialBreakdown>);

    setMaterialBreakdown(
      Object.values(grouped).sort((a, b) => b.total_qty - a.total_qty).slice(0, 10)
    );
  };

  const loadTopClients = async () => {
    const dateFilter = getDateFilter();

    let query = supabase
      .from('invoices')
      .select('client_id, total, clients(name)');

    if (dateFilter) {
      query = query.gte('invoice_date', dateFilter);
    }

    const { data } = await query;

    if (!data) {
      setTopClients([]);
      return;
    }

    const grouped = data.reduce((acc, invoice: any) => {
      const clientName = invoice.clients?.name || 'Unknown';
      if (!acc[clientName]) {
        acc[clientName] = {
          client_name: clientName,
          invoice_count: 0,
          total_revenue: 0,
        };
      }
      acc[clientName].invoice_count += 1;
      acc[clientName].total_revenue += Number(invoice.total);
      return acc;
    }, {} as Record<string, TopClient>);

    setTopClients(
      Object.values(grouped).sort((a, b) => b.total_revenue - a.total_revenue).slice(0, 5)
    );
  };

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <div style={{ fontSize: 18, color: '#9ca3af' }}>Loading dashboard...</div>
      </div>
    );
  }

  const revenueChartData = {
    labels: timeSeries.map(d => d.period),
    datasets: [
      {
        label: 'Revenue (EGP)',
        data: timeSeries.map(d => d.revenue),
        borderColor: '#38bdf8',
        backgroundColor: 'rgba(56, 189, 248, 0.1)',
        tension: 0.3,
      },
    ],
  };

  const categoryChartData = {
    labels: categoryData.map(d => d.category),
    datasets: [
      {
        label: 'Items Sold',
        data: categoryData.map(d => d.itemCount),
        backgroundColor: [
          '#38bdf8',
          '#818cf8',
          '#a78bfa',
          '#f472b6',
          '#fb923c',
          '#fbbf24',
          '#34d399',
          '#4ade80',
        ],
      },
    ],
  };

  const materialChartData = {
    labels: materialBreakdown.map(m => m.material_name),
    datasets: [
      {
        label: 'Total Quantity',
        data: materialBreakdown.map(m => m.total_qty),
        backgroundColor: 'rgba(56, 189, 248, 0.6)',
      },
    ],
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(circle at top, #020617 0%, #020617 40%, #000 100%)',
      padding: '24px',
    }}>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
        }}>
          <h1 style={{
            fontSize: 28,
            fontWeight: 600,
            color: '#e5e7eb',
            margin: 0,
          }}>
            Analytics Dashboard
          </h1>

          <div style={{ display: 'flex', gap: 8 }}>
            {(['7days', '30days', '90days', 'all'] as const).map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 8,
                  border: timeRange === range ? '1px solid #38bdf8' : '1px solid #374151',
                  background: timeRange === range ? '#38bdf8' : '#020617',
                  color: timeRange === range ? '#020617' : '#e5e7eb',
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                {range === 'all' ? 'All Time' : range.replace('days', ' Days')}
              </button>
            ))}
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 16,
          marginBottom: 24,
        }}>
          <KpiCard
            title="Total Revenue"
            value={`${summary?.totalRevenue.toLocaleString('en-EG', {
              style: 'currency',
              currency: 'EGP',
              minimumFractionDigits: 0,
            })}`}
            subtitle={`${summary?.totalInvoices} invoices`}
          />
          <KpiCard
            title="Average Invoice"
            value={`${summary?.avgInvoiceValue.toLocaleString('en-EG', {
              style: 'currency',
              currency: 'EGP',
              minimumFractionDigits: 0,
            })}`}
            subtitle="per invoice"
          />
          <KpiCard
            title="Items Sold"
            value={summary?.totalItemsSold.toString() || '0'}
            subtitle="total units"
          />
          <KpiCard
            title="Paid Invoices"
            value={`${summary?.paidCount}/${summary?.totalInvoices}`}
            subtitle={`${summary?.draftCount} drafts, ${summary?.sentCount} sent`}
          />
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
          gap: 16,
          marginBottom: 16,
        }}>
          <ChartCard title="Revenue Over Time">
            {timeSeries.length > 0 ? (
              <Line data={revenueChartData} options={{
                responsive: true,
                plugins: { legend: { display: false } },
              }} />
            ) : (
              <EmptyState message="No invoice data available" />
            )}
          </ChartCard>

          <ChartCard title="Items by Category">
            {categoryData.length > 0 ? (
              <Doughnut data={categoryChartData} options={{
                responsive: true,
                plugins: { legend: { position: 'right' } },
              }} />
            ) : (
              <EmptyState message="No category data available" />
            )}
          </ChartCard>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
          gap: 16,
        }}>
          <ChartCard title="Top Materials Used">
            {materialBreakdown.length > 0 ? (
              <Bar data={materialChartData} options={{
                responsive: true,
                indexAxis: 'y',
                plugins: { legend: { display: false } },
              }} />
            ) : (
              <EmptyState message="No material data available" />
            )}
          </ChartCard>

          <ChartCard title="Top Clients">
            {topClients.length > 0 ? (
              <div style={{ padding: '16px 0' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #374151' }}>
                      <th style={{ textAlign: 'left', padding: '8px 0', color: '#9ca3af', fontSize: 12 }}>
                        Client
                      </th>
                      <th style={{ textAlign: 'right', padding: '8px 0', color: '#9ca3af', fontSize: 12 }}>
                        Invoices
                      </th>
                      <th style={{ textAlign: 'right', padding: '8px 0', color: '#9ca3af', fontSize: 12 }}>
                        Revenue
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {topClients.map((client, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #1f2937' }}>
                        <td style={{ padding: '12px 0', color: '#e5e7eb', fontSize: 14 }}>
                          {client.client_name}
                        </td>
                        <td style={{ padding: '12px 0', color: '#e5e7eb', fontSize: 14, textAlign: 'right' }}>
                          {client.invoice_count}
                        </td>
                        <td style={{ padding: '12px 0', color: '#e5e7eb', fontSize: 14, textAlign: 'right' }}>
                          {client.total_revenue.toLocaleString('en-EG', {
                            style: 'currency',
                            currency: 'EGP',
                            minimumFractionDigits: 0,
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState message="No client data available" />
            )}
          </ChartCard>
        </div>

        {materialBreakdown.length > 0 && (
          <ChartCard title="Material Breakdown (Detailed)" style={{ marginTop: 16 }}>
            <div style={{ padding: '16px 0' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #374151' }}>
                    <th style={{ textAlign: 'left', padding: '8px 0', color: '#9ca3af', fontSize: 12 }}>
                      Material
                    </th>
                    <th style={{ textAlign: 'right', padding: '8px 0', color: '#9ca3af', fontSize: 12 }}>
                      Total Quantity
                    </th>
                    <th style={{ textAlign: 'right', padding: '8px 0', color: '#9ca3af', fontSize: 12 }}>
                      Unit
                    </th>
                    <th style={{ textAlign: 'right', padding: '8px 0', color: '#9ca3af', fontSize: 12 }}>
                      Used In
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {materialBreakdown.map((material, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #1f2937' }}>
                      <td style={{ padding: '12px 0', color: '#e5e7eb', fontSize: 14 }}>
                        {material.material_name}
                      </td>
                      <td style={{ padding: '12px 0', color: '#e5e7eb', fontSize: 14, textAlign: 'right' }}>
                        {material.total_qty.toFixed(2)}
                      </td>
                      <td style={{ padding: '12px 0', color: '#e5e7eb', fontSize: 14, textAlign: 'right' }}>
                        {material.unit}
                      </td>
                      <td style={{ padding: '12px 0', color: '#e5e7eb', fontSize: 14, textAlign: 'right' }}>
                        {material.usage_count} items
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ChartCard>
        )}
      </div>
    </div>
  );
};

const KpiCard: React.FC<{ title: string; value: string; subtitle?: string }> = ({
  title,
  value,
  subtitle
}) => (
  <div style={{
    background: '#020617',
    border: '1px solid #1f2937',
    borderRadius: 12,
    padding: 20,
  }}>
    <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 8 }}>{title}</div>
    <div style={{ fontSize: 24, fontWeight: 600, color: '#e5e7eb', marginBottom: 4 }}>
      {value}
    </div>
    {subtitle && <div style={{ fontSize: 11, color: '#6b7280' }}>{subtitle}</div>}
  </div>
);

const ChartCard: React.FC<{ title: string; children: React.ReactNode; style?: React.CSSProperties }> = ({
  title,
  children,
  style,
}) => (
  <div style={{
    background: '#020617',
    border: '1px solid #1f2937',
    borderRadius: 12,
    padding: 20,
    ...style,
  }}>
    <h3 style={{
      fontSize: 16,
      fontWeight: 600,
      color: '#e5e7eb',
      marginTop: 0,
      marginBottom: 16,
    }}>
      {title}
    </h3>
    {children}
  </div>
);

const EmptyState: React.FC<{ message: string }> = ({ message }) => (
  <div style={{
    padding: 40,
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 14,
  }}>
    {message}
  </div>
);

export default Dashboard;
