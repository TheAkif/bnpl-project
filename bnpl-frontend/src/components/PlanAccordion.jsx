import { useState } from "react";
import InstallmentTable from "./InstallmentTable";
import "../pages/UserDashboard.css";
import "../pages/MerchantDashboard.css";

export default function PlanAccordion({ plans, onPay }) {
  const [openPlan, setOpenPlan] = useState(null);

  const toggle = (planId) => setOpenPlan(openPlan === planId ? null : planId);

  const totalPlans = plans.length;

  return (
    <div>
      {plans.map((plan, idx) => {
        const paidCount = plan.installments.filter(
          (i) => i.status === "paid"
        ).length;
        const badgeType =
          paidCount === plan.num_installments ? "paid" : "pending";

        return (
          <div key={plan.id} className="accordion-item">
            {/* Header */}
            <div
              className="plan-card"
              onClick={() => toggle(plan.id)}
              style={{ cursor: "pointer" }}
            >
              {/* Top row: title, meta & badge */}
              <div className="plan-header">
                <div>
                  <h4 className="plan-title">
                    Payment Plan {idx + 1} of {totalPlans}
                  </h4>
                  <p className="plan-meta">
                    {plan.total_amount} SAR · {plan.num_installments}{" "}
                    installments
                  </p>
                </div>
                <span
                  className={`plan-badge ${
                    badgeType === "paid" ? "completed" : "active"
                  }`}
                >
                  {paidCount}/{plan.num_installments} paid
                </span>
              </div>

              {/* Progress bar */}
              <div className="plan-progress">
                <div
                  style={{
                    width: `${Math.round(
                      (paidCount / plan.num_installments) * 100
                    )}%`,
                  }}
                />
              </div>
            </div>

            {/* Content */}
            {openPlan === plan.id && (
              <div className="accordion-content">
                <InstallmentTable
                  installments={plan.installments.map((inst) => ({
                    ...inst,
                    planId: idx + 1,
                  }))}
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
