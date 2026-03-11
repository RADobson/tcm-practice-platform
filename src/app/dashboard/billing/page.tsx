'use client';

import { useEffect, useState, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAppStore } from '@/lib/store';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import toast from 'react-hot-toast';
import type { Invoice, InvoiceItem, PaymentRecord, InvoiceStatus } from '@/lib/types';

type PatientOption = { id: string; first_name: string; last_name: string };

interface InvoiceWithPatient extends Omit<Invoice, 'patient'> {
  patient?: { id: string; first_name: string; last_name: string };
}

const STATUS_OPTIONS: InvoiceStatus[] = ['draft', 'sent', 'paid', 'overdue', 'cancelled'];

const SERVICE_PRESETS = [
  { description: 'Initial Consultation', unit_price: 150 },
  { description: 'Follow-up Consultation', unit_price: 100 },
  { description: 'Acupuncture Treatment', unit_price: 120 },
  { description: 'Herbal Formula', unit_price: 80 },
  { description: 'Cupping Therapy', unit_price: 60 },
  { description: 'Tuina Massage', unit_price: 80 },
];

const PAYMENT_METHODS = ['Cash', 'Check', 'Credit Card', 'Insurance', 'Other'];

const emptyItem: InvoiceItem = {
  description: '',
  quantity: 1,
  unit_price: 0,
  amount: 0,
};

function generateInvoiceNumber(): string {
  const now = new Date();
  const dateStr = format(now, 'yyyyMMdd');
  const seq = String(Math.floor(Math.random() * 999) + 1).padStart(3, '0');
  return `INV-${dateStr}-${seq}`;
}

export default function BillingPage() {
  const { practice } = useAppStore();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [invoices, setInvoices] = useState<InvoiceWithPatient[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Views
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  // Invoice form state
  const [form, setForm] = useState({
    patient_id: '',
    invoice_number: generateInvoiceNumber(),
    issue_date: format(new Date(), 'yyyy-MM-dd'),
    due_date: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    tax_rate: 0,
    discount: 0,
    notes: '',
  });
  const [items, setItems] = useState<InvoiceItem[]>([{ ...emptyItem }]);

  // Payment form state
  const [paymentForm, setPaymentForm] = useState({
    amount: 0,
    method: 'Cash',
    reference: '',
  });

  useEffect(() => {
    if (!practice) return;
    loadData();
  }, [practice]);

  async function loadData() {
    const [invoicesRes, patientsRes] = await Promise.all([
      supabase
        .from('invoices')
        .select('*, patient:patients(id, first_name, last_name)')
        .eq('practice_id', practice!.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('patients')
        .select('id, first_name, last_name')
        .eq('practice_id', practice!.id)
        .eq('is_active', true)
        .order('last_name'),
    ]);
    setInvoices(invoicesRes.data || []);
    setPatients(patientsRes.data || []);
    setLoading(false);
  }

  // Calculated totals for form
  const subtotal = useMemo(() =>
    items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0),
    [items]
  );

  const taxAmount = useMemo(() =>
    subtotal * (form.tax_rate / 100),
    [subtotal, form.tax_rate]
  );

  const total = useMemo(() =>
    subtotal + taxAmount - form.discount,
    [subtotal, taxAmount, form.discount]
  );

  // Summary stats
  const stats = useMemo(() => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    const outstanding = invoices
      .filter(i => i.status === 'sent' || i.status === 'overdue')
      .reduce((sum, i) => sum + (i.total - i.amount_paid), 0);

    const overdue = invoices
      .filter(i => i.status === 'overdue')
      .reduce((sum, i) => sum + (i.total - i.amount_paid), 0);

    const paidThisMonth = invoices
      .filter(i => {
        if (i.status !== 'paid') return false;
        const paidDate = new Date(i.updated_at);
        return paidDate >= monthStart && paidDate <= monthEnd;
      })
      .reduce((sum, i) => sum + i.total, 0);

    return { outstanding, overdue, paidThisMonth };
  }, [invoices]);

  // Filtered invoices
  const filteredInvoices = useMemo(() => {
    if (statusFilter === 'all') return invoices;
    return invoices.filter(i => i.status === statusFilter);
  }, [invoices, statusFilter]);

  function updateItem(index: number, field: keyof InvoiceItem, value: string | number) {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    // Auto-calculate amount
    newItems[index].amount = newItems[index].quantity * newItems[index].unit_price;
    setItems(newItems);
  }

  function addItem() {
    setItems([...items, { ...emptyItem }]);
  }

  function removeItem(index: number) {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  }

  function resetForm() {
    setForm({
      patient_id: '',
      invoice_number: generateInvoiceNumber(),
      issue_date: format(new Date(), 'yyyy-MM-dd'),
      due_date: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
      tax_rate: 0,
      discount: 0,
      notes: '',
    });
    setItems([{ ...emptyItem }]);
    setEditingId(null);
  }

  function loadInvoiceIntoForm(inv: Invoice) {
    setForm({
      patient_id: inv.patient_id,
      invoice_number: inv.invoice_number,
      issue_date: inv.issue_date ? format(new Date(inv.issue_date), 'yyyy-MM-dd') : '',
      due_date: inv.due_date ? format(new Date(inv.due_date), 'yyyy-MM-dd') : '',
      tax_rate: inv.tax_rate || 0,
      discount: inv.discount || 0,
      notes: inv.notes || '',
    });
    setItems(inv.items?.length > 0 ? inv.items : [{ ...emptyItem }]);
    setEditingId(inv.id);
    setViewingInvoice(null);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.patient_id) {
      toast.error('Please select a patient');
      return;
    }

    const record = {
      practice_id: practice!.id,
      patient_id: form.patient_id,
      invoice_number: form.invoice_number,
      status: 'draft' as InvoiceStatus,
      issue_date: form.issue_date,
      due_date: form.due_date,
      subtotal,
      tax_rate: form.tax_rate,
      tax_amount: taxAmount,
      discount: form.discount,
      total,
      amount_paid: 0,
      notes: form.notes || null,
      items,
      payment_history: [],
    };

    let error;
    if (editingId) {
      const existing = invoices.find(i => i.id === editingId);
      ({ error } = await supabase.from('invoices').update({
        ...record,
        status: existing?.status || 'draft',
        amount_paid: existing?.amount_paid || 0,
        payment_history: existing?.payment_history || [],
      }).eq('id', editingId));
    } else {
      ({ error } = await supabase.from('invoices').insert(record));
    }

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(editingId ? 'Invoice updated' : 'Invoice created');
      setShowForm(false);
      resetForm();
      loadData();
    }
  }

  async function updateInvoiceStatus(id: string, status: InvoiceStatus) {
    const { error } = await supabase.from('invoices').update({ status }).eq('id', id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(`Invoice marked as ${status}`);
      loadData();
      // Update viewing invoice if open
      if (viewingInvoice?.id === id) {
        setViewingInvoice({ ...viewingInvoice, status });
      }
    }
  }

  async function recordPayment() {
    if (!viewingInvoice) return;
    if (paymentForm.amount <= 0) {
      toast.error('Payment amount must be positive');
      return;
    }

    const newPayment: PaymentRecord = {
      date: new Date().toISOString(),
      amount: paymentForm.amount,
      method: paymentForm.method,
      reference: paymentForm.reference || undefined,
    };

    const updatedHistory = [...(viewingInvoice.payment_history || []), newPayment];
    const newAmountPaid = viewingInvoice.amount_paid + paymentForm.amount;
    const newStatus = newAmountPaid >= viewingInvoice.total ? 'paid' : viewingInvoice.status;

    const { error } = await supabase.from('invoices').update({
      payment_history: updatedHistory,
      amount_paid: newAmountPaid,
      status: newStatus,
    }).eq('id', viewingInvoice.id);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Payment recorded');
      setShowPaymentForm(false);
      setPaymentForm({ amount: 0, method: 'Cash', reference: '' });
      loadData();
      setViewingInvoice({
        ...viewingInvoice,
        payment_history: updatedHistory,
        amount_paid: newAmountPaid,
        status: newStatus as InvoiceStatus,
      });
    }
  }

  function getPatientName(id: string) {
    const p = patients.find(pt => pt.id === id);
    return p ? `${p.first_name} ${p.last_name}` : 'Unknown';
  }

  function getStatusBadge(status: InvoiceStatus) {
    switch (status) {
      case 'draft': return 'badge bg-gray-500/10 text-gray-400';
      case 'sent': return 'badge-cyan';
      case 'paid': return 'badge-success';
      case 'overdue': return 'badge-danger';
      case 'cancelled': return 'badge bg-gray-600/10 text-gray-500 line-through';
      default: return 'badge-earth';
    }
  }

  function formatCurrency(amount: number) {
    return `$${amount.toFixed(2)}`;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Billing</h1>
          <p className="text-sm text-gray-400">Manage invoices and payments</p>
        </div>
        <button
          onClick={() => {
            if (showForm) { setShowForm(false); resetForm(); }
            else { setShowForm(true); setViewingInvoice(null); }
          }}
          className="btn-primary"
        >
          {showForm ? 'Cancel' : '+ New Invoice'}
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="stat-card">
          <div className="stat-label">Outstanding Balance</div>
          <div className="stat-value text-cyan-400">{formatCurrency(stats.outstanding)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Overdue Amount</div>
          <div className="stat-value text-red-400">{formatCurrency(stats.overdue)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Paid This Month</div>
          <div className="stat-value text-emerald-400">{formatCurrency(stats.paidThisMonth)}</div>
        </div>
      </div>

      {/* Invoice Detail View */}
      {viewingInvoice && !showForm && (
        <div className="card mb-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white">{viewingInvoice.invoice_number}</h2>
              <p className="text-sm text-gray-400">
                Patient: {getPatientName(viewingInvoice.patient_id)}
              </p>
              <span className={`${getStatusBadge(viewingInvoice.status)} mt-2 inline-block`}>
                {viewingInvoice.status.toUpperCase()}
              </span>
            </div>
            <div className="flex gap-2 flex-wrap justify-end">
              {viewingInvoice.status === 'draft' && (
                <button
                  onClick={() => updateInvoiceStatus(viewingInvoice.id, 'sent')}
                  className="btn-cyan text-sm"
                >
                  Send Invoice
                </button>
              )}
              {(viewingInvoice.status === 'sent' || viewingInvoice.status === 'overdue') && (
                <>
                  <button
                    onClick={() => {
                      setPaymentForm({
                        amount: viewingInvoice.total - viewingInvoice.amount_paid,
                        method: 'Cash',
                        reference: '',
                      });
                      setShowPaymentForm(true);
                    }}
                    className="btn-primary text-sm"
                  >
                    Record Payment
                  </button>
                  <button
                    onClick={() => updateInvoiceStatus(viewingInvoice.id, 'paid')}
                    className="btn-secondary text-sm"
                  >
                    Mark Paid
                  </button>
                </>
              )}
              {viewingInvoice.status !== 'cancelled' && viewingInvoice.status !== 'paid' && (
                <button
                  onClick={() => updateInvoiceStatus(viewingInvoice.id, 'cancelled')}
                  className="btn-danger text-sm"
                >
                  Cancel
                </button>
              )}
              <button onClick={() => loadInvoiceIntoForm(viewingInvoice)} className="btn-secondary text-sm">
                Edit
              </button>
              <button onClick={() => setViewingInvoice(null)} className="btn-secondary text-sm">
                Close
              </button>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-sm">
            <div>
              <span className="text-xs text-gray-500 uppercase tracking-wider">Issue Date</span>
              <p className="text-gray-300 mt-1">
                {viewingInvoice.issue_date ? format(new Date(viewingInvoice.issue_date), 'MMM d, yyyy') : '--'}
              </p>
            </div>
            <div>
              <span className="text-xs text-gray-500 uppercase tracking-wider">Due Date</span>
              <p className="text-gray-300 mt-1">
                {viewingInvoice.due_date ? format(new Date(viewingInvoice.due_date), 'MMM d, yyyy') : '--'}
              </p>
            </div>
            <div>
              <span className="text-xs text-gray-500 uppercase tracking-wider">Amount Paid</span>
              <p className="text-emerald-400 mt-1 font-medium">
                {formatCurrency(viewingInvoice.amount_paid)}
              </p>
            </div>
            <div>
              <span className="text-xs text-gray-500 uppercase tracking-wider">Balance Due</span>
              <p className="text-white mt-1 font-bold">
                {formatCurrency(viewingInvoice.total - viewingInvoice.amount_paid)}
              </p>
            </div>
          </div>

          {/* Line Items */}
          <div className="mb-6">
            <span className="text-xs text-gray-500 uppercase tracking-wider">Line Items</span>
            <table className="w-full mt-2">
              <thead className="border-b border-dark-50">
                <tr>
                  <th className="table-header">Description</th>
                  <th className="table-header text-right">Qty</th>
                  <th className="table-header text-right">Unit Price</th>
                  <th className="table-header text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-50">
                {viewingInvoice.items?.map((item, i) => (
                  <tr key={i}>
                    <td className="table-cell text-white">{item.description}</td>
                    <td className="table-cell text-right">{item.quantity}</td>
                    <td className="table-cell text-right">{formatCurrency(item.unit_price)}</td>
                    <td className="table-cell text-right text-white font-medium">{formatCurrency(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="mt-4 flex flex-col items-end gap-1 text-sm">
              <div className="flex gap-8">
                <span className="text-gray-500">Subtotal:</span>
                <span className="text-gray-300 w-24 text-right">{formatCurrency(viewingInvoice.subtotal)}</span>
              </div>
              {viewingInvoice.tax_rate > 0 && (
                <div className="flex gap-8">
                  <span className="text-gray-500">Tax ({viewingInvoice.tax_rate}%):</span>
                  <span className="text-gray-300 w-24 text-right">{formatCurrency(viewingInvoice.tax_amount)}</span>
                </div>
              )}
              {viewingInvoice.discount > 0 && (
                <div className="flex gap-8">
                  <span className="text-gray-500">Discount:</span>
                  <span className="text-red-400 w-24 text-right">-{formatCurrency(viewingInvoice.discount)}</span>
                </div>
              )}
              <div className="flex gap-8 border-t border-dark-50 pt-1 mt-1">
                <span className="text-white font-medium">Total:</span>
                <span className="text-white font-bold w-24 text-right">{formatCurrency(viewingInvoice.total)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {viewingInvoice.notes && (
            <div className="mb-6">
              <span className="text-xs text-gray-500 uppercase tracking-wider">Notes</span>
              <p className="text-sm text-gray-300 mt-1">{viewingInvoice.notes}</p>
            </div>
          )}

          {/* Payment History */}
          <div>
            <span className="text-xs text-gray-500 uppercase tracking-wider">Payment History</span>
            {viewingInvoice.payment_history?.length > 0 ? (
              <div className="mt-2 space-y-2">
                {viewingInvoice.payment_history.map((p, i) => (
                  <div key={i} className="flex items-center justify-between bg-dark-300/50 rounded-lg px-4 py-2.5">
                    <div className="flex items-center gap-3">
                      <span className="badge-success">{p.method}</span>
                      <span className="text-sm text-gray-400">
                        {format(new Date(p.date), 'MMM d, yyyy h:mm a')}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-emerald-400 font-medium">{formatCurrency(p.amount)}</span>
                      {p.reference && (
                        <span className="text-xs text-gray-500 ml-2">Ref: {p.reference}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 mt-2">No payments recorded yet.</p>
            )}
          </div>

          {/* Payment Form Modal */}
          {showPaymentForm && (
            <div className="mt-4 p-4 bg-dark-300/50 rounded-lg border border-dark-50">
              <h3 className="text-sm font-semibold text-white mb-3">Record Payment</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="input-label">Amount *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="input-field"
                    value={paymentForm.amount}
                    onChange={e => setPaymentForm({ ...paymentForm, amount: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="input-label">Method *</label>
                  <select
                    className="input-field"
                    value={paymentForm.method}
                    onChange={e => setPaymentForm({ ...paymentForm, method: e.target.value })}
                  >
                    {PAYMENT_METHODS.map(m => <option key={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="input-label">Reference Number</label>
                  <input
                    className="input-field"
                    placeholder="Check #, card last 4, claim #..."
                    value={paymentForm.reference}
                    onChange={e => setPaymentForm({ ...paymentForm, reference: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowPaymentForm(false)}
                  className="btn-secondary text-sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={recordPayment}
                  className="btn-primary text-sm"
                >
                  Record Payment
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Invoice Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="card mb-6 space-y-6">
          <h2 className="text-lg font-semibold text-white">
            {editingId ? 'Edit Invoice' : 'Create Invoice'}
          </h2>

          {/* Basic Info */}
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="input-label">Patient *</label>
              <select
                className="input-field"
                required
                value={form.patient_id}
                onChange={e => setForm({ ...form, patient_id: e.target.value })}
              >
                <option value="">Select patient...</option>
                {patients.map(p => (
                  <option key={p.id} value={p.id}>{p.last_name}, {p.first_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="input-label">Invoice Number</label>
              <input
                className="input-field"
                value={form.invoice_number}
                onChange={e => setForm({ ...form, invoice_number: e.target.value })}
              />
            </div>
            <div>
              <label className="input-label">Issue Date</label>
              <input
                type="date"
                className="input-field"
                value={form.issue_date}
                onChange={e => setForm({ ...form, issue_date: e.target.value })}
              />
            </div>
            <div>
              <label className="input-label">Due Date</label>
              <input
                type="date"
                className="input-field"
                value={form.due_date}
                onChange={e => setForm({ ...form, due_date: e.target.value })}
              />
            </div>
          </div>

          {/* Line Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="input-label mb-0">Line Items</label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Quick add:</span>
                {SERVICE_PRESETS.map(preset => (
                  <button
                    key={preset.description}
                    type="button"
                    className="text-[10px] px-2 py-1 rounded bg-dark-200 text-gray-400 hover:text-earth-300 hover:bg-dark-100 transition-colors"
                    onClick={() => {
                      // Add preset as new item
                      setItems([...items, {
                        description: preset.description,
                        quantity: 1,
                        unit_price: preset.unit_price,
                        amount: preset.unit_price,
                      }]);
                    }}
                    title={`$${preset.unit_price}`}
                  >
                    {preset.description}
                  </button>
                ))}
              </div>
            </div>

            <table className="w-full">
              <thead className="border-b border-dark-50">
                <tr>
                  <th className="table-header">Description</th>
                  <th className="table-header text-right w-20">Qty</th>
                  <th className="table-header text-right w-28">Unit Price</th>
                  <th className="table-header text-right w-28">Amount</th>
                  <th className="table-header w-12"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={idx} className="border-b border-dark-50/50">
                    <td className="py-2 pr-2">
                      <div className="relative">
                        <input
                          className="input-field text-sm py-1.5"
                          placeholder="Service description..."
                          value={item.description}
                          onChange={e => updateItem(idx, 'description', e.target.value)}
                          list={`presets-${idx}`}
                        />
                        <datalist id={`presets-${idx}`}>
                          {SERVICE_PRESETS.map(p => (
                            <option key={p.description} value={p.description} />
                          ))}
                        </datalist>
                      </div>
                    </td>
                    <td className="py-2 px-1">
                      <input
                        type="number"
                        min="1"
                        className="input-field text-sm py-1.5 text-right"
                        value={item.quantity}
                        onChange={e => updateItem(idx, 'quantity', parseInt(e.target.value) || 1)}
                      />
                    </td>
                    <td className="py-2 px-1">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        className="input-field text-sm py-1.5 text-right"
                        value={item.unit_price}
                        onChange={e => updateItem(idx, 'unit_price', parseFloat(e.target.value) || 0)}
                      />
                    </td>
                    <td className="py-2 px-1 text-right text-sm text-white font-medium">
                      {formatCurrency(item.quantity * item.unit_price)}
                    </td>
                    <td className="py-2 pl-1 text-center">
                      <button
                        type="button"
                        className="text-red-400 hover:text-red-300 text-sm disabled:opacity-30"
                        disabled={items.length <= 1}
                        onClick={() => removeItem(idx)}
                      >
                        x
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <button
              type="button"
              onClick={addItem}
              className="mt-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              + Add Line Item
            </button>
          </div>

          {/* Totals */}
          <div className="flex flex-col items-end gap-2">
            <div className="w-72 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Subtotal:</span>
                <span className="text-white">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm items-center gap-2">
                <span className="text-gray-400">Tax Rate (%):</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="input-field text-sm py-1 w-20 text-right"
                  value={form.tax_rate}
                  onChange={e => setForm({ ...form, tax_rate: parseFloat(e.target.value) || 0 })}
                />
              </div>
              {form.tax_rate > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Tax Amount:</span>
                  <span className="text-white">{formatCurrency(taxAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm items-center gap-2">
                <span className="text-gray-400">Discount ($):</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="input-field text-sm py-1 w-20 text-right"
                  value={form.discount}
                  onChange={e => setForm({ ...form, discount: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="flex justify-between text-sm border-t border-dark-50 pt-2">
                <span className="text-white font-semibold">Total:</span>
                <span className="text-white font-bold text-lg">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="input-label">Notes</label>
            <textarea
              className="input-field"
              rows={2}
              placeholder="Payment terms, additional notes..."
              value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2 border-t border-dark-50">
            <button
              type="button"
              onClick={() => { setShowForm(false); resetForm(); }}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {editingId ? 'Update Invoice' : 'Create Invoice'}
            </button>
          </div>
        </form>
      )}

      {/* Invoice List */}
      {!showForm && !viewingInvoice && (
        <>
          {/* Status Filter */}
          <div className="flex gap-2 mb-4 flex-wrap">
            {['all', ...STATUS_OPTIONS].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  statusFilter === status
                    ? 'bg-earth-300/20 text-earth-300 border border-earth-300/30'
                    : 'bg-dark-300 text-gray-400 border border-dark-50 hover:text-white'
                }`}
              >
                {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                {status !== 'all' && (
                  <span className="ml-1.5 text-xs opacity-60">
                    ({invoices.filter(i => i.status === status).length})
                  </span>
                )}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-gray-400 text-center py-8">Loading invoices...</div>
          ) : filteredInvoices.length === 0 ? (
            <div className="card text-center py-12">
              <div className="text-gray-500 text-4xl mb-3">&#9634;</div>
              <p className="text-gray-400">
                {statusFilter !== 'all'
                  ? `No ${statusFilter} invoices found.`
                  : 'No invoices yet. Create your first invoice to get started.'
                }
              </p>
              {statusFilter === 'all' && (
                <button onClick={() => setShowForm(true)} className="btn-cyan mt-4 text-sm">
                  Create First Invoice
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-dark-50">
                  <tr>
                    <th className="table-header">Invoice #</th>
                    <th className="table-header">Patient</th>
                    <th className="table-header">Issue Date</th>
                    <th className="table-header">Due Date</th>
                    <th className="table-header text-right">Total</th>
                    <th className="table-header text-right">Paid</th>
                    <th className="table-header text-right">Balance</th>
                    <th className="table-header">Status</th>
                    <th className="table-header">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-50">
                  {filteredInvoices.map(inv => (
                    <tr key={inv.id} className="hover:bg-dark-300/30">
                      <td className="table-cell">
                        <button
                          onClick={() => setViewingInvoice(inv)}
                          className="text-white hover:text-earth-300 font-medium"
                        >
                          {inv.invoice_number}
                        </button>
                      </td>
                      <td className="table-cell">
                        {inv.patient
                          ? `${inv.patient.first_name} ${inv.patient.last_name}`
                          : getPatientName(inv.patient_id)
                        }
                      </td>
                      <td className="table-cell text-xs">
                        {inv.issue_date ? format(new Date(inv.issue_date), 'MMM d, yyyy') : '--'}
                      </td>
                      <td className="table-cell text-xs">
                        {inv.due_date ? format(new Date(inv.due_date), 'MMM d, yyyy') : '--'}
                      </td>
                      <td className="table-cell text-right text-white font-medium">
                        {formatCurrency(inv.total)}
                      </td>
                      <td className="table-cell text-right text-emerald-400">
                        {formatCurrency(inv.amount_paid)}
                      </td>
                      <td className="table-cell text-right font-medium">
                        <span className={inv.total - inv.amount_paid > 0 ? 'text-amber-400' : 'text-emerald-400'}>
                          {formatCurrency(inv.total - inv.amount_paid)}
                        </span>
                      </td>
                      <td className="table-cell">
                        <span className={getStatusBadge(inv.status)}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="table-cell">
                        <button
                          onClick={() => setViewingInvoice(inv)}
                          className="text-sm text-cyan-400 hover:text-cyan-300"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
