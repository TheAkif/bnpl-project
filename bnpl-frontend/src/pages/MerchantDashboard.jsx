// import { useState, useEffect } from "react";
// import { getPlans } from "../api/plans";
// import PlanForm from "../components/PlanForm";
// import Navbar from "../components/Navbar";
// import "./MerchantDashboard.css";
// import { toast } from "react-toastify";

// export default function MerchantDashboard() {
//   const [plans, setPlans] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     async function load() {
//       try {
//         const data = await getPlans();
//         setPlans(data);
//       } catch {
//         toast.error("Failed to load plans. Please logout and login again.");
//       } finally {
//         setLoading(false);
//       }
//     }
//     load();
//   }, []);

// const handleNewPlan = (plan) => {
//   setPlans((prev) => [plan, ...prev]);
// };
  
//   return (
//     <div className="min-h-screen bg-gray-50">
//       <Navbar title="Merchant Dashboard" />

//       <div className="merchant-page">
//         <aside className="merchant-sidebar">
//           <PlanForm onSuccess={handleNewPlan} />
//         </aside>

//         {/* Plans*/}
//         <main className="merchant-main">
//           {loading ? (
//             <p>Loading plans…</p>
//           ) : plans.length === 0 ? (
//             <p>No plans yet.</p>
//           ) : (
//             plans.map((plan, idx) => {
//               const paidCount = plan.installments.filter(
//                 (i) => i.status === "paid"
//               ).length;
//               const pct = Math.round((paidCount / plan.num_installments) * 100);
//               const badgeClass = pct === 100 ? "completed" : "active";

//               return (
//                 <div key={plan.id} className="plan-card">
//                   <div className="plan-header">
//                     <div>
//                       <h4 className="plan-title">Plan #{idx + 1}</h4>
//                       <p className="plan-meta">
//                         {plan.total_amount} SAR · {plan.num_installments}{" "}
//                         installments
//                       </p>
//                     </div>
//                     <span className={`plan-badge ${badgeClass}`}>
//                       {paidCount}/{plan.num_installments} paid
//                     </span>
//                   </div>
//                   <div className="plan-progress">
//                     <div style={{ width: `${pct}%` }} />
//                   </div>
//                 </div>
//               );
//             })
//           )}
//         </main>
//       </div>
//     </div>
//   );
// }


// src/pages/MerchantDashboard.jsx
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { getPlans } from "../api/plans";
import PlanForm from "../components/PlanForm";
import MerchantAnalytics from "../components/MerchantAnalytics";
import Navbar from "../components/Navbar";
import "./MerchantDashboard.css";

export default function MerchantDashboard() {
  const [plans, setPlans]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView]       = useState("plans"); // "plans" | "analytics"

  // Load plans
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

  // PlanForm success & error handlers
  const handleNewPlan = plan => {
    setPlans(prev => [plan, ...prev]);
    toast.success("Plan created successfully");
  };

  const handlePlanError = err => {
    const status = err.response?.status;
    let msg = status >= 500
      ? "Failed to create plan."
      : (() => {
          const d = err.response?.data || {};
          return (
            d.customer_email ??
            d.total_amount ??
            d.num_installments ??
            d.start_date ??
            d.detail ??
            (Array.isArray(d.non_field_errors) && d.non_field_errors[0]) ??
            "Failed to create plan."
          );
        })();
    toast.error(msg);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="Merchant Dashboard" />

      <div className="merchant-page">
        {/* Sidebar: only the PlanForm */}
        <aside className="merchant-sidebar">
          <PlanForm onSuccess={handleNewPlan} onError={handlePlanError} />
        </aside>

        {/* Main: tabs + content */}
        <main className="merchant-main">
          {/* Tabs */}
          <div className="tabs">
            <button
              className={`tab ${view === "plans" ? "active" : ""}`}
              onClick={() => setView("plans")}
            >
              Plans
            </button>
            <button
              className={`tab ${view === "analytics" ? "active" : ""}`}
              onClick={() => setView("analytics")}
            >
              Analytics
            </button>
          </div>

          {/* Tab panels */}
          {view === "plans" ? (
            loading ? (
              <p>Loading plans…</p>
            ) : plans.length === 0 ? (
              <p>No plans yet.</p>
            ) : (
              plans.map((plan, idx) => {
                const paidCount = plan.installments.filter(
                  i => i.status === "paid"
                ).length;
                const pct = Math.round(
                  (paidCount / plan.num_installments) * 100
                );
                const badgeClass = pct === 100 ? "completed" : "active";

                return (
                  <div key={plan.id} className="plan-card">
                    <div className="plan-header">
                      <div>
                        <h4 className="plan-title">Plan {idx + 1}</h4>
                        <p className="plan-meta">
                          {plan.total_amount} SAR · {plan.num_installments} installments
                        </p>
                      </div>
                      <span className={`plan-badge ${badgeClass}`}>
                        {paidCount}/{plan.num_installments} paid
                      </span>
                    </div>
                    <div className="plan-progress">
                      <div style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })
            )
          ) : (
            <MerchantAnalytics />
          )}
        </main>
      </div>
    </div>
  );
}
