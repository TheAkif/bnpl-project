import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { getPlans } from "../api/plans";
import PlanForm from "../components/PlanForm";
import MerchantAnalytics from "../components/MerchantAnalytics";
import Navbar from "../components/Navbar";
import "./MerchantDashboard.css";

export default function MerchantDashboard() {
  const [plans,   setPlans]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [view,    setView]    = useState("plans");

  useEffect(() => {
    async function load() {
      try {
        const data = await getPlans();
        setPlans(data);
      } catch {
        toast.error("Failed to load plans. Please re-login.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleNewPlan = plan => {
    setPlans(prev => [plan, ...prev]);
    toast.success("Plan created successfully");
  };

  const handlePlanError = err => {
    const d = err.response?.data || {};
    const msg = err.response?.status >= 500
      ? "Failed to create plan."
      : d.customer_email ?? d.total_amount ?? d.num_installments ??
        d.start_date ?? d.detail ??
        d.non_field_errors?.[0] ?? "Failed to create plan.";
    toast.error(msg);
  };

  return (
    <div>
      <Navbar title="Merchant Dashboard" />
      <div className="merchant-page">

        <aside className="merchant-sidebar">
          <p className="sidebar-heading">New Plan</p>
          <p className="sidebar-subheading">Create an installment plan for a customer</p>
          <div className="sidebar-divider" />
          <PlanForm onSuccess={handleNewPlan} onError={handlePlanError} />
        </aside>

        <main className="merchant-main">
          <div className="tabs">
            <button
              className={`tab ${view === "plans" ? "active" : ""}`}
              onClick={() => setView("plans")}
            >
              Plans {!loading && `(${plans.length})`}
            </button>
            <button
              className={`tab ${view === "analytics" ? "active" : ""}`}
              onClick={() => setView("analytics")}
            >
              Analytics
            </button>
          </div>

          {view === "plans" ? (
            loading ? (
              <div className="state-message">Loading plans...</div>
            ) : plans.length === 0 ? (
              <div className="state-message">
                <strong>No plans yet</strong>
                Create your first installment plan using the form on the left.
              </div>
            ) : (
              <div className="plans-grid">
                {plans.map((plan, idx) => {
                  const paidCount = plan.installments.filter(i => i.status === "paid").length;
                  const pct = Math.round((paidCount / plan.num_installments) * 100);
                  const isCompleted = pct === 100;

                  return (
                    <div key={plan.id} className="plan-card">
                      <div className="plan-header">
                        <div>
                          <p className="plan-number">Plan {idx + 1}</p>
                          <p className="plan-amount">
                            {Number(plan.total_amount).toLocaleString()}
                            <span className="plan-currency">SAR</span>
                          </p>
                        </div>
                        <span className={`plan-badge ${isCompleted ? "completed" : "active"}`}>
                          {isCompleted ? "Completed" : "Active"}
                        </span>
                      </div>

                      <p className="plan-installments">
                        {plan.num_installments} monthly installments of{" "}
                        {Number(plan.total_amount / plan.num_installments).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} SAR
                      </p>

                      <div className="plan-progress-row">
                        <span className="plan-progress-label">{paidCount} of {plan.num_installments} paid</span>
                        <span className="plan-progress-pct">{pct}%</span>
                      </div>
                      <div className="plan-progress">
                        <div className="plan-progress-fill" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            <MerchantAnalytics />
          )}
        </main>
      </div>
    </div>
  );
}
