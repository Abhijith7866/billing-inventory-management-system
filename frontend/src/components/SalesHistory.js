import { useEffect, useState } from "react";
import axios from "axios";

import "./SalesHistory.css";

function SalesHistory() {
  const API = "https://billing-backend-sigma.vercel.app";

  const [sales, setSales] = useState([]);

  // =========================
  // Fetch Sales History
  // =========================
  const fetchSalesHistory = async () => {
    try {
      const res = await axios.get(`${API}/sales-history`);

      setSales(res.data);
    } catch (err) {
      console.log(err);

      alert("Failed to fetch sales history");
    }
  };

  useEffect(() => {
    fetchSalesHistory();
  }, []);

  return (
    <div className="sales-history-container">
      <h1 className="sales-history-title">Sales History</h1>

      {sales.length === 0 ? (
        <p className="no-sales">No Sales Found</p>
      ) : (
        <table className="sales-table">
          <thead>
            <tr>
              <th>Bill ID</th>

              <th>Total Amount</th>

              <th>Date & Time</th>
            </tr>
          </thead>

          <tbody>
            {sales.map((bill) => (
              <tr key={bill.id}>
                <td>#{bill.id}</td>

                <td>₹ {bill.total_amount}</td>

                <td>{new Date(bill.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default SalesHistory;
