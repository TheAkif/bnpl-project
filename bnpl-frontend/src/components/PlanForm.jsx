import { useState } from "react";
import { createPlan } from "../api/plans";
import { toast } from "react-toastify";

export default function PlanForm({ onSuccess, onError }) {
  const [customerEmail,    setCustomerEmail]    = useState("");
  const [totalAmount,      setTotalAmount]      = useState("");
  const [numInstallments,  setNumInstallments]  = useState(2);
  const [startDate,        setStartDate]        = useState("");
  const [submitting,       setSubmitting]       = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const plan = await createPlan({
        customer_email:   customerEmail,
        total_amount:     totalAmount,
        num_installments: numInstallments,
        start_date:       startDate,
      });
      onSuccess(plan);
      setCustomerEmail("");
      setTotalAmount("");
      setNumInstallments(2);
      setStartDate("");
    } catch (err) {
      onError?.(err);
      const d = err.response?.data || {};
      const msg =
        d.customer_email?.[0] ?? d.customer_email ??
        d.total_amount?.[0]   ?? d.total_amount   ??
        d.num_installments?.[0] ?? d.num_installments ??
        d.start_date?.[0]     ?? d.start_date     ??
        d.detail ??
        d.non_field_errors?.[0] ??
        "Plan creation failed.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="sidebar-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="customerEmail">Customer Email</label>
        <input
          id="customerEmail"
          type="email"
          value={customerEmail}
          onChange={e => setCustomerEmail(e.target.value)}
          placeholder="customer@example.com"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="totalAmount">Total Amount</label>
        <input
          id="totalAmount"
          type="number"
          step="0.01"
          min="100.01"
          max="9999.99"
          value={totalAmount}
          onChange={e => setTotalAmount(e.target.value)}
          placeholder="e.g. 1200.00"
          required
        />
        <p className="field-hint">Between SAR 100 and SAR 10,000</p>
      </div>

      <div className="form-group">
        <label htmlFor="numInstallments">Installments</label>
        <input
          id="numInstallments"
          type="number"
          min={2}
          value={numInstallments}
          onChange={e => setNumInstallments(parseInt(e.target.value, 10))}
          required
        />
        <p className="field-hint">Minimum 2 installments</p>
      </div>

      <div className="form-group">
        <label htmlFor="startDate">Start Date</label>
        <input
          id="startDate"
          type="date"
          value={startDate}
          onChange={e => setStartDate(e.target.value)}
          required
        />
      </div>

      <button type="submit" className="submit-btn" disabled={submitting}>
        {submitting ? "Creating..." : "Create Plan"}
      </button>
    </form>
  );
}
