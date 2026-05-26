import { useEffect, useState } from "react";

import { useParams } from "react-router-dom";

import axios from "axios";

import "./BillDetails.css";

function BillDetails() {
  const { id } = useParams();

  const [bill, setBill] = useState(null);

  const [items, setItems] = useState([]);

  useEffect(() => {
    fetchBillDetails();
  }, []);

  const fetchBillDetails = async () => {
    try {
      const response = await axios.get(
        `https://billing-backend-sigma.vercel.app/bill-details/${id}`,
      );

      setBill(response.data.bill);

      setItems(response.data.items);
    } catch (error) {
      console.log(error);
    }
  };

  if (!bill) {
    return <h1>Loading...</h1>;
  }

  return (
    <div className="bill-details-page">
      <div className="bill-details-card">
        <div className="bill-top">
          <div>
            <h1>Invoice Details</h1>

            <p>Invoice ID: {bill.invoice_number}</p>
          </div>
        </div>

        <div className="customer-section">
          <div className="customer-box">
            <h3>Customer</h3>

            <p>{bill.customer_name}</p>
          </div>

          <div className="customer-box">
            <h3>Phone</h3>

            <p>{bill.customer_phone}</p>
          </div>

          <div className="customer-box">
            <h3>Date</h3>

            <p>
              {new Date(bill.bill_date).toLocaleDateString("en-IN", {
                day: "numeric",

                month: "long",

                year: "numeric",
              })}
            </p>
          </div>
        </div>

        <div className="items-section">
          <table>
            <thead>
              <tr>
                <th>Product</th>

                <th>Category</th>

                <th>Price</th>

                <th>Qty</th>

                <th>Total</th>
              </tr>
            </thead>

            <tbody>
              {items.map((item, index) => (
                <tr key={index}>
                  <td>{item.product_name}</td>

                  <td>{item.category}</td>

                  <td>₹ {item.price}</td>

                  <td>{item.quantity}</td>

                  <td>₹ {item.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="total-section">
          <h2>Total Amount</h2>

          <h1>₹ {bill.final_total || bill.total}</h1>
        </div>
      </div>
    </div>
  );
}

export default BillDetails;
