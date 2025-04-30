import { useState, useEffect, useMemo } from "react";
import { getPlans, payInstallment } from "../api/plans";
import { toast } from "react-toastify";
import Navbar from "../components/Navbar";
import InstallmentCalendar from "../components/InstallmentCalender";
import InstallmentTable from "../components/InstallmentTable";
import PlanAccordion from "../components/PlanAccordion";
import "./UserDashboard.css";

export default function UserDashboard() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDate, setDate] = useState(null);

  // Fetch once
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

  // Flatten all installments with planNumber
  const allInstallments = useMemo(
    () =>
      plans.flatMap((plan, idx) =>
        plan.installments.map((inst) => ({
          ...inst,
          planNumber: idx + 1,
        }))
      ),
    [plans]
  );

  // Filter for the selected date
  const displayedInstallments = selectedDate
    ? allInstallments.filter(
        (inst) =>
          new Date(inst.due_date).toDateString() === selectedDate.toDateString()
      )
    : allInstallments;

  // Payment handler
  const handlePay = async (id) => {
    try {
      const updated = await payInstallment(id);
      setPlans((pls) =>
        pls.map((plan) => ({
          ...plan,
          installments: plan.installments.map((inst) =>
            inst.id === updated.id ? updated : inst
          ),
        }))
      );
      toast.success("Installment paid!");
    } catch (err) {
      let msg =
        err.response?.data?.detail ||
        (Array.isArray(err.response?.data?.non_field_errors) &&
          err.response.data.non_field_errors[0]) ||
        "";

      if (!msg && err.response?.request?.response) {
        try {
          const payload = JSON.parse(err.response.request.response);
          msg =
            payload.detail ||
            (Array.isArray(payload.non_field_errors) &&
              payload.non_field_errors[0]) ||
            "";
        } catch {
          msg = "Payment failed."
          toast.error(msg);    
        }
      }
      if (!msg) msg = "Payment failed.";
      toast.error(msg);
    }
  };

  return (
    <div className="user-page">
      <Navbar title="User Dashboard" />
      <div className="user-content dashboard-main">
        {/* LEFT: Calendar + filtered installments */}
        <div className="dashboard-left">
          <div className="calendar-container">
            <InstallmentCalendar
              installments={allInstallments}
              selectedDate={selectedDate}
              onDateChange={setDate}
            />
          </div>
          <div className="table-container">
            {loading ? (
              <p>Loading installments…</p>
            ) : displayedInstallments.length === 0 ? (
              <p>
                {selectedDate
                  ? "No installments on this date."
                  : "Click any date to see installments."}
              </p>
            ) : (
              <InstallmentTable
                installments={displayedInstallments.map((inst) => ({
                  ...inst,
                  planId: inst.planNumber,
                }))}
                onPay={handlePay}
              />
            )}
          </div>
        </div>
        {/* RIGHT: Detailed Plans Accordion */}
        <div className="dashboard-right">
          <h3>All Your Plans</h3>
          {loading ? (
            <p>Loading plans…</p>
          ) : plans.length === 0 ? (
            <p>No plans found.</p>
          ) : (
            <PlanAccordion plans={plans} onPay={handlePay} />
          )}
        </div>
      </div>
    </div>
  );
}
