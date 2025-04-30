import React, { useState } from 'react';
import "../pages/UserDashboard.css";

export default function InstallmentTable({ installments, onPay, pageSize = 5 }) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(installments.length / pageSize);

  const startIdx = (currentPage - 1) * pageSize;
  const currentRows = installments.slice(startIdx, startIdx + pageSize);

  const goPrev = () => setCurrentPage(p => Math.max(p - 1, 1));
  const goNext = () => setCurrentPage(p => Math.min(p + 1, totalPages));

  return (
    <>
      <table className="installment-table">
        <thead>
          <tr>
            {["Plan", "Amount", "Due Date", "Status", "Action"].map((header) => (
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {currentRows.map((inst) => (
            <tr key={inst.id}>
              <td>{inst.planId}</td>
              <td>{inst.amount}</td>
              <td>{inst.due_date}</td>
              <td>
                <span className={`badge badge-${inst.status}`}>
                  {inst.status}
                </span>
              </td>
              <td>
                {inst.status === "pending" || inst.status === "late" ? (
                  <button onClick={() => onPay(inst.id)} className="pay-btn">
                    Pay Now
                  </button>
                ) : (
                  <button disabled className="paid-btn">
                    Paid
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={goPrev}
            disabled={currentPage === 1}
            className="page-button"
          >
            ‹ Prev
          </button>
          <span className="page-info">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={goNext}
            disabled={currentPage === totalPages}
            className="page-button"
          >
            Next ›
          </button>
        </div>
      )}
    </>
  );
}
