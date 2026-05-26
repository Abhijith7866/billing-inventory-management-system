import React from "react";

import "./InvoiceTemplate.css";

function InvoiceTemplate({

  billItems,
  customerName,
  customerPhone,
  invoiceNumber,
  subTotal,
  gstPercentage,
  gstAmount,
  finalTotal,

}) {

  return (

    <div className="invoice-template">

      {/* HEADER */}

      <div className="invoice-header">

        <div>

          <h1>Billing Software</h1>

          <p>Smart Billing & Inventory System</p>

        </div>

        <div className="invoice-number">

          {invoiceNumber}

        </div>

      </div>

      {/* CUSTOMER DETAILS */}

      <div className="invoice-details">

        <div className="detail-box">

          <h4>Customer</h4>

          <p>{customerName || "Walk-in Customer"}</p>

        </div>

        <div className="detail-box">

          <h4>Phone</h4>

          <p>{customerPhone || "-"}</p>

        </div>

        <div className="detail-box">

          <h4>Date</h4>

          <p>

            {new Date().toLocaleDateString()}

          </p>

        </div>

      </div>

      {/* TABLE */}

      <table className="invoice-table">

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

          {billItems.map((item, index) => (

            <tr key={index}>

              <td>{item.product_name}</td>

              <td>{item.category}</td>

              <td>₹ {item.price}</td>

              <td>{item.billQuantity}</td>

              <td>₹ {item.total}</td>

            </tr>

          ))}

        </tbody>

      </table>

      {/* SUMMARY */}

      <div className="invoice-summary">

        <div className="summary-row">

          <span>Subtotal</span>

          <span>

            ₹ {subTotal.toFixed(2)}

          </span>

        </div>

        <div className="summary-row">

          <span>

            GST ({gstPercentage}%)

          </span>

          <span>

            ₹ {gstAmount.toFixed(2)}

          </span>

        </div>

        <div className="summary-row total-row">

          <span>Final Total</span>

          <span>

            ₹ {finalTotal.toFixed(2)}

          </span>

        </div>

      </div>

      {/* FOOTER */}

      <div className="invoice-footer">

        Thank you for shopping with us ❤️

      </div>

    </div>

  );
}

export default InvoiceTemplate;