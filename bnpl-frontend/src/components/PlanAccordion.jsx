import { useState } from "react";
import InstallmentTable from "./InstallmentTable";
import "../pages/UserDashboard.css";

const fmtAmount = n => Number(n).toLocaleString("en-SA", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function PlanAccordion({ plans, onPay }) {
  const [openPlan, setOpenPlan] = useState(null);

  const toggle = planId => setOpenPlan(openPlan === planId ? null : planId);

  return (
    <div className="accordion-list">
      {plans.map((plan, idx) => {
        const paidCount = plan.installments.filter(i => i.status === "paid").length;
        const pct       = Math.round((paidCount / plan.num_installments) * 100);
        const isOpen    = openPlan === plan.id;
        const isCompleted = paidCount === plan.num_installments;

        return (
          <div key={plan.id} className="accordion-item">
            <div className="accordion-header" onClick={() => toggle(plan.id)}>
              <div className="accordion-header-left">
                <p className="accordion-plan-label">Plan {idx + 1}</p>
                <p className="accordion-plan-amount">{fmtAmount(plan.total_amount)} SAR</p>
                <p className="accordion-plan-meta">{plan.num_installments} installments</p>
              </div>
              <div className="accordion-right">
                <span className={`badge ${isCompleted ? "badge-paid" : "badge-pending"}`}>
                  {paidCount}/{plan.num_installments} paid
                </span>
                <span className={`accordion-chevron ${isOpen ? "open" : ""}`}>&#9660;</span>
              </div>
            </div>

            <div className="accordion-progress">
              <div className="accordion-progress-fill" style={{ width: `${pct}%` }} />
            </div>

            {isOpen && (
              <div className="accordion-content">
                <InstallmentTable
                  installments={plan.installments.map(inst => ({ ...inst, planId: idx + 1 }))}
                  onPay={onPay}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
