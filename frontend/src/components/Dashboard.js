import { useEffect, useState } from "react";

import axios from "axios";

import jsPDF from "jspdf";

import autoTable from "jspdf-autotable";
import { Link } from "react-router-dom";

import { toast } from "react-toastify";

import {
  BarChart,
  PieChart,
  LineChart,
  Line,
  Pie,
  Cell,
  Legend,
  RadarChart,
  Bar,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import {
  FaBox,
  FaWarehouse,
  FaFileInvoice,
  FaIndianRupeeSign,
  FaMagnifyingGlass,
  FaDownload,
} from "react-icons/fa6";

import "./Dashboard.css";

const Dashboard = () => {
  const [products, setProducts] = useState([]);

  const [bills, setBills] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [categoryData, setCategoryData] = useState([]);

  const [monthlySales, setMonthlySales] = useState([]);

  const [topProducts, setTopProducts] = useState([]);

  // =========================================
  // FETCH DATA
  // =========================================

  useEffect(() => {
    fetchDashboardData();

    fetchCategoryAnalytics();

    fetchMonthlySales();
    fetchTopProducts();
  }, []);

  // =========================================
  // FETCH DASHBOARD DATA
  // =========================================

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const productResponse = await axios.get(
        "https://billing-backend-sigma.vercel.app/products",
      );

      const billResponse = await axios.get(
        "https://billing-backend-sigma.vercel.app/bills",
      );

      setProducts(productResponse.data);

      setBills(billResponse.data);
    } catch (error) {
      console.log("Dashboard Error:", error);

      toast.error("Failed to load dashboard ❌");
    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // FETCH CATEGORY ANALYTICS
  // =========================================

  const fetchCategoryAnalytics = async () => {
    try {
      const response = await axios.get(
        "https://billing-backend-sigma.vercel.app/category-analytics",
      );

      setCategoryData(response.data);
    } catch (error) {
      console.log("Category Analytics Error:", error);
    }
  };

  // =========================================
  // FETCH MONTHLY SALES
  // =========================================

  const fetchMonthlySales = async () => {
    try {
      const response = await axios.get(
        "https://billing-backend-sigma.vercel.app/monthly-sales",
      );

      setMonthlySales(response.data);
    } catch (error) {
      console.log("Monthly Sales Error:", error);
    }
  };

  // =========================================
  // FETCH TOP PRODUCTS
  // =========================================

  const fetchTopProducts = async () => {
    try {
      const response = await axios.get(
        "https://billing-backend-sigma.vercel.app/top-products",
      );

      setTopProducts(response.data);
    } catch (error) {
      console.log("Top Products Error:", error);
    }
  };

  // =========================================
  // TOTAL PRODUCTS
  // =========================================

  const totalProducts = products.length;

  // =========================================
  // TOTAL STOCK
  // =========================================

  const totalStock = products.reduce(
    (total, product) => total + product.quantity,

    0,
  );

  // =========================================
  // TOTAL BILLS
  // =========================================

  const totalBills = bills.length;

  // =========================================
  // TOTAL REVENUE
  // =========================================

  const totalRevenue = bills.reduce(
    (total, bill) => total + Number(bill.final_total),

    0,
  );

  // =========================================
  // LOW STOCK
  // =========================================

  const lowStockProducts = products.filter((product) => product.quantity <= 5);

  // =========================================
  // BAR CHART DATA
  // =========================================

  const chartData = bills.map((bill) => ({
    invoice: bill.invoice_number,

    revenue: bill.final_total,
  }));

  // =========================================
  // PIE CHART COLORS
  // =========================================

  const COLORS = [
    "#3b82f6",
    "#8b5cf6",
    "#22c55e",
    "#f59e0b",
    "#ef4444",
    "#06b6d4",
  ];

  // =========================================
  // FORMAT DATE
  // =========================================

  const formatDate = (dateStr) => {
    if (!dateStr) return "No Date";

    const date = new Date(dateStr);

    if (isNaN(date)) return dateStr;

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // =========================================
  // SEARCH FILTER
  // =========================================

  const filteredBills = bills.filter((bill) => {
    const query = search.toLowerCase();

    return (
      bill.invoice_number.toLowerCase().includes(query) ||
      bill.customer_name.toLowerCase().includes(query) ||
      bill.final_total.toString().includes(query)
    );
  });

  // =========================================
  // PDF DOWNLOAD
  // =========================================

  const downloadInvoice = (bill) => {
    const doc = new jsPDF();

    // TITLE

    doc.setFontSize(24);

    doc.setTextColor(37, 99, 235);

    doc.text("Billing Invoice", 14, 20);

    // LINE

    doc.setDrawColor(200);

    doc.line(14, 28, 195, 28);

    // CUSTOMER DETAILS

    doc.setFontSize(13);

    doc.setTextColor(0, 0, 0);

    doc.text(`Invoice No: ${bill.invoice_number}`, 14, 45);

    doc.text(`Customer Name: ${bill.customer_name}`, 14, 55);

    doc.text(`Amount: Rs. ${bill.final_total}`, 14, 65);

    doc.text(`Date: ${formatDate(bill.bill_date)}`, 14, 75);

    // TABLE

    autoTable(doc, {
      startY: 95,

      head: [["Field", "Value"]],

      body: [
        ["Invoice Number", bill.invoice_number],

        ["Customer Name", bill.customer_name],

        ["Total Amount", `Rs. ${bill.final_total}`],

        ["Date", formatDate(bill.bill_date)],
      ],

      theme: "grid",

      headStyles: {
        fillColor: [37, 99, 235],

        textColor: 255,

        fontSize: 12,
      },

      bodyStyles: {
        fontSize: 11,
      },
    });

    // FOOTER

    doc.setFontSize(11);

    doc.setTextColor(100);

    doc.text("Thank you for your purchase!", 14, 280);

    // SAVE PDF

    doc.save(`${bill.invoice_number}.pdf`);

    // SUCCESS TOAST

    toast.success("Invoice Downloaded ✅");
  };

  // =========================================
  // LOADING
  // =========================================

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>

        <p>Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* HEADER */}

      <div className="dashboard-header">
        <div>
          <h1>Analytics Dashboard</h1>

          <p className="dashboard-subtitle">
            Welcome back 👋 Here's your business overview today.
          </p>
        </div>
      </div>

      {/* CARDS */}

      <div className="dashboard-cards">
        <div className="dashboard-card">
          <div className="card-top">
            <h2>Total Products</h2>

            <FaBox className="card-icon" />
          </div>

          <p>{totalProducts}</p>
        </div>

        <div className="dashboard-card">
          <div className="card-top">
            <h2>Total Stock</h2>

            <FaWarehouse className="card-icon" />
          </div>

          <p>{totalStock}</p>
        </div>

        <div className="dashboard-card">
          <div className="card-top">
            <h2>Total Bills</h2>

            <FaFileInvoice className="card-icon" />
          </div>

          <p>{totalBills}</p>
        </div>

        <div className="dashboard-card">
          <div className="card-top">
            <h2>Total Revenue</h2>

            <FaIndianRupeeSign className="card-icon" />
          </div>

          <p>₹ {totalRevenue.toFixed(2)}</p>
        </div>
      </div>

      {/* REVENUE BAR CHART */}

      <div className="chart-section">
        <h2>Revenue Analytics</h2>

        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="invoice" />

            <YAxis />

            <Tooltip />

            <Bar dataKey="revenue" fill="#2563eb" radius={[10, 10, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* PIE CHART */}

      <div className="chart-section">
        <h2>Category Distribution</h2>

        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={categoryData}
              dataKey="total"
              nameKey="category"
              cx="50%"
              cy="50%"
              outerRadius={140}
              label
            >
              {categoryData.map((entry, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>

            <Tooltip />

            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* MONTHLY SALES */}

      <div className="chart-section">
        <h2>Monthly Revenue</h2>

        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={monthlySales}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="month" />

            <YAxis />

            <Tooltip />

            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#22c55e"
              strokeWidth={4}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* TOP SELLING PRODUCTS */}

      <div className="chart-section">
        <h2>Top Selling Products</h2>

        <ResponsiveContainer width="100%" height={400}>
          <RadarChart outerRadius={150} data={topProducts}>
            <PolarGrid />

            <PolarAngleAxis dataKey="product_name" />

            <Radar
              name="Sales"
              dataKey="totalSold"
              stroke="#8b5cf6"
              fill="#8b5cf6"
              fillOpacity={0.6}
            />

            <Tooltip />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* RECENT BILLS */}

      <div className="recent-bills-section">
        <div className="bills-header">
          <h2>Recent Bills</h2>

          <div className="search-box">
            <FaMagnifyingGlass className="search-icon" />

            <input
              type="text"
              placeholder="Search invoice, customer, amount..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <table className="recent-bills-table">
          <thead>
            <tr>
              <th>Invoice</th>

              <th>Customer</th>

              <th>Amount</th>

              <th>Date</th>

              <th>PDF</th>
            </tr>
          </thead>

          <tbody>
            {filteredBills.length > 0 ? (
              filteredBills.slice(0, 5).map((bill) => (
                <tr key={bill.id}>
                  <td>
                    <Link
                      to={`/bill-details/${bill.id}`}
                      className="invoice-link"
                    >
                      {bill.invoice_number}
                    </Link>
                  </td>

                  <td>{bill.customer_name}</td>

                  <td>₹ {bill.final_total}</td>

                  <td>{formatDate(bill.bill_date)}</td>

                  <td>
                    <button
                      className="download-btn"
                      onClick={() => downloadInvoice(bill)}
                    >
                      <FaDownload />
                      Download
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="no-results">
                  No bills found for "{search}"
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* LOW STOCK */}

      <div className="low-stock-section">
        <h2>⚠ Low Stock Products</h2>

        {lowStockProducts.length > 0 ? (
          lowStockProducts.map((product) => (
            <div key={product.id} className="low-stock-item">
              <span>{product.product_name}</span>

              <span className="stock-count">{product.quantity} left</span>
            </div>
          ))
        ) : (
          <p className="no-stock-alert">No low stock products 🎉</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
