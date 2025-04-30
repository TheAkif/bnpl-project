import { useState } from "react";
import { createPlan } from "../api/plans";
import { toast } from "react-toastify";

export default function PlanForm({ onSuccess, onError }) {
  const [customerEmail, setCustomerEmail] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [numInstallments, setNumInstallments] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setSubmitting(true);
  //   try {
  //     const plan = await createPlan({
  //       customer_email: customerEmail, // <-- use email now
  //       total_amount: totalAmount,
  //       num_installments: numInstallments,
  //       start_date: startDate,
  //     });
  //     onSuccess(plan);
  //     // reset form
  //     setCustomerEmail("");
  //     setTotalAmount("");
  //     setNumInstallments(1);
  //     setStartDate("");
  //   } catch (err) {
  //     onError?.(err);
  //     let msg =
  //       err.response?.data?.detail ||
  //       (Array.isArray(err.response?.data?.non_field_errors) &&
  //         err.response.data.non_field_errors[0]) ||
  //       "";

  //     if (!msg && err.response?.request?.response) {
  //       try {
  //         console.log(err)
  //         const payload = JSON.parse(err.response.request.response);
  //         msg =
  //           payload.detail ||
  //           (Array.isArray(payload.non_field_errors) &&
  //             payload.non_field_errors[0]) ||
  //           "";
  //       } catch {
  //         msg = "Plan creation failed.";
  //         toast.error(msg);
  //       }
  //     }
  //     if (!msg) msg = "Plan creation failed.";
  //     toast.error(msg);
  //   } finally {
  //     setSubmitting(false);
  //   }
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const plan = await createPlan({
        customer_email: customerEmail,
        total_amount: totalAmount,
        num_installments: numInstallments,
        start_date: startDate,
      });

      onSuccess(plan);
      toast.success("Plan created successfully");

      // reset form
      setCustomerEmail("");
      setTotalAmount("");
      setNumInstallments(1);
      setStartDate("");
    } catch (err) {
      // optional upstream callback
      onError?.(err);

      let msg = "";
      const data = err.response?.data;

      // 1️⃣ Check field‐specific errors
      if (data) {
        if (data.customer_email) {
          msg = Array.isArray(data.customer_email)
            ? data.customer_email[0]
            : data.customer_email;
        } else if (data.start_date) {
          msg = Array.isArray(data.start_date)
            ? data.start_date[0]
            : data.start_date;
        } else if (data.num_installments) {
          msg = Array.isArray(data.num_installments)
            ? data.num_installments[0]
            : data.num_installments;
        } else if (data.total_amount) {
          msg = Array.isArray(data.total_amount)
            ? data.total_amount[0]
            : data.total_amount;
        } else if (data.detail) {
          msg = data.detail;
        } else if (Array.isArray(data.non_field_errors)) {
          msg = data.non_field_errors[0];
        }
      }

      // 2️⃣ Fallback: raw JSON string (if any)
      if (!msg && err.response?.request?.response) {
        try {
          const payload = JSON.parse(err.response.request.response);
          if (payload.customer_email) {
            msg = Array.isArray(payload.customer_email)
              ? payload.customer_email[0]
              : payload.customer_email;
          } else if (payload.start_date) {
            msg = Array.isArray(payload.start_date)
              ? payload.start_date[0]
              : payload.start_date;
          } else if (payload.num_installments) {
            msg = Array.isArray(payload.num_installments)
              ? payload.num_installments[0]
              : payload.num_installments;
          } else if (payload.total_amount) {
            msg = Array.isArray(payload.total_amount)
              ? payload.total_amount[0]
              : payload.total_amount;
          } else if (payload.detail) {
            msg = payload.detail;
          } else if (Array.isArray(payload.non_field_errors)) {
            msg = payload.non_field_errors[0];
          }
        } catch {
          // ignore JSON parse errors
        }
      }

      // 3️⃣ Final fallback
      if (!msg) {
        msg = "Plan creation failed.";
      }

      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 400, margin: "auto" }}>
      <h3>Create New Plan</h3>

      <label>Customer Email</label>
      <br />
      <input
        type="email"
        value={customerEmail}
        onChange={(e) => setCustomerEmail(e.target.value)}
        required
      />

      <label style={{ marginTop: 10 }}>Total Amount (e.g. 1000.00)</label>
      <br />
      <input
        type="text"
        value={totalAmount}
        onChange={(e) => setTotalAmount(e.target.value)}
        required
      />

      <label style={{ marginTop: 10 }}>Number of Installments</label>
      <br />
      <input
        type="number"
        value={numInstallments}
        min={1}
        onChange={(e) => setNumInstallments(parseInt(e.target.value, 10))}
        required
      />

      <label style={{ marginTop: 10 }}>Start Date</label>
      <br />
      <input
        type="date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
        required
      />

      <button type="submit" disabled={submitting} style={{ marginTop: 20 }}>
        {submitting ? "Creating…" : "Create Plan"}
      </button>
    </form>
  );
}
