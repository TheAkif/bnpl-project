import { useState, useEffect, useMemo } from "react";
import { getPlans, payInstallment } from "../api/plans";
import { toast } from "react-toastify";
import Navbar from "../components/Navbar";
import InstallmentCalendar from "../components/InstallmentCalender";
import InstallmentTable from "../components/InstallmentTable";
import PlanAccordion from "../components/PlanAccordion";
import "./UserDashboard.css";

export default function UserDashboard() {
  const [plans,   setPlans]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setDate] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await getPlans();
        setPlans(data);
      } catch {
        toast.error("Failed to load plans");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const allInstallments = useMemo(
    () => plans.flatMap((plan, idx) =>
      plan.installments.map(inst => ({ ...inst, planNumber: idx + 1 }))
    ),
    [plans]
  );

  const displayedInstallments = selectedDate
    ? allInstallments.filter(
        inst => new Date(inst.due_date).toDateString() === selectedDate.toDateString()
      )
    : allInstallments;

  const handlePay = async id => {
    try {
      const updated = await payInstallment(id);
      setPlans(pls =>
        pls.map(plan => ({
          ...plan,
          installments: plan.installments.map(inst => inst.id === updated.id ? updated : inst),
        }))
      );
      toast.success("Installment paid!");
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.non_field_errors?.[0] ||
        "Payment failed.";
      toast.error(msg);
    }
  };

  return (
    <div className="user-page">
      <Navbar title="User Dashboard" />
      <div className="user-content">

        <div className="dashboard-left">
          <div className="calendar-container">
            <InstallmentCalendar
              installments={allInstallments}
              selectedDate={selectedDate}
              onDateChange={setDate}
            />
            {selectedDate && (
              <div className="calendar-filter-bar">
                <span className="calendar-filter-label">
                  Showing installments for {selectedDate.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                </span>
                <button className="calendar-clear-btn" onClick={() => setDate(null)}>
                  Clear filter
                </button>
              </div>
            )}
          </div>

          <div className="table-container">
            <div className="table-header">
              <p className="table-title">Installments</p>
              <span className="table-count">{displayedInstallments.length} total</span>
            </div>
            {loading ? (
              <div className="state-empty">Loading...</div>
            ) : displayedInstallments.length === 0 ? (
              <div className="state-empty">
                {selectedDate ? "No installments on this date." : "No installments found."}
              </div>
            ) : (
              <InstallmentTable
                installments={displayedInstallments.map(inst => ({ ...inst, planId: inst.planNumber }))}
                onPay={handlePay}
              />
            )}
          </div>
        </div>

        <div className="dashboard-right">
          <p className="section-heading">Your Plans</p>
          {loading ? (
            <div className="state-empty">Loading...</div>
          ) : plans.length === 0 ? (
            <div className="state-empty">No plans found.</div>
          ) : (
            <PlanAccordion plans={plans} onPay={handlePay} />
          )}
        </div>

      </div>
    </div>
  );
}
