import React, { useState } from "react";
import "../pages/UserDashboard.css";

const fmtAmount = n => Number(n).toLocaleString("en-SA", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtDate   = d => new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

export default function InstallmentTable({ installments, onPay, pageSize = 5 }) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(installments.length / pageSize);
  const currentRows = installments.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <>
      <table className="installment-table">
        <thead>
          <tr>
            {["Plan", "Amount (SAR)", "Due Date", "Status", "Action"].map(h => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {currentRows.map(inst => (
            <tr key={inst.id}>
              <td>#{inst.planId}</td>
              <td>{fmtAmount(inst.amount)}</td>
              <td>{fmtDate(inst.due_date)}</td>
              <td><span className={`badge badge-${inst.status}`}>{inst.status}</span></td>
              <td>
                {inst.status === "pending" || inst.status === "late" ? (
                  <button onClick={() => onPay(inst.id)} className="pay-btn">Pay Now</button>
                ) : (
                  <button disabled className="paid-btn">Paid</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className="pagination">
          <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1} className="page-button">
            Prev
          </button>
          <span className="page-info">Page {currentPage} of {totalPages}</span>
          <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages} className="page-button">
            Next
          </button>
        </div>
      )}
    </>
  );
}
