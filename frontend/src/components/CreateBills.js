import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import axios from "axios";
import { toast } from "react-toastify";

import InvoiceTemplate from "./InvoiceTemplate";

import {
  FiSearch,
  FiFilter,
  FiUser,
  FiPhone,
  FiTrash2,
  FiSave,
  FiPrinter,
  FiAlertTriangle,
  FiXCircle,
  FiPlusCircle,
} from "react-icons/fi";

import "./CreateBills.css";

const API = "https://billing-backend-sigma.vercel.app";

const CreateBill = () => {
  const [products, setProducts] = useState([]);
  const [billItems, setBillItems] = useState([]);
  const [quantities, setQuantities] = useState({});

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  // Add this state near your other states
  const [aiLoading, setAiLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const [recommendations, setRecommendations] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [aiCustomer, setAiCustomer] = useState(null);

  const invoiceNumber = "INV-" + Math.floor(Math.random() * 10000);

  // =========================================
  // FETCH PRODUCTS
  // =========================================

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API}/products`);

      setProducts(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.log(err);
    }
  };

  // =========================================
  // FETCH AI RECOMMENDATIONS
  // =========================================

  const fetchRecommendations = async (phone) => {
    if (phone.length < 10) return;
    setAiLoading(true);

    try {
      const res = await axios.get(`${API}/reorder-recommendations/${phone}`);

      console.log("AI Response:", res.data);

      // New response format: { isReturning, customer, suggestions }
      if (res.data.isReturning && res.data.suggestions.length > 0) {
        setAiCustomer(res.data.customer); // { name, phone }
        setRecommendations(res.data.suggestions); // array of items
        setShowPopup(true);
      }
    } catch (err) {
      console.log("AI lookup error:", err);
    } finally {
      setAiLoading(false); // 👈 hide spinner
    }
  };

  const addRecommendedItem = async (recommendedItem) => {
    const product = products.find(
      (p) => p.product_name === recommendedItem.product_name,
    );

    if (!product) {
      toast.error("Product not found");

      return;
    }

    if (product.quantity <= 0) {
      toast.warning("Product out of stock");

      return;
    }

    const existingItem = billItems.find((item) => item.id === product.id);

    await axios.put(`${API}/update-stock/${product.id}`, {
      quantity: 1,
    });

    if (existingItem) {
      const updatedBillItems = billItems.map((item) => {
        if (item.id === product.id) {
          const newQuantity = item.billQuantity + 1;

          return {
            ...item,
            billQuantity: newQuantity,
            total: item.price * newQuantity,
          };
        }

        return item;
      });

      setBillItems(updatedBillItems);
    } else {
      const item = {
        ...product,

        billQuantity: 1,

        total: product.price,
      };

      setBillItems([...billItems, item]);
    }

    toast.success("Recommended item added ✅");
    setShowPopup(false);

    fetchProducts();
  };
  // =========================================
  // ADD TO BILL
  // =========================================

  const addToBill = async (product) => {
    const quantity = Number(quantities[product.id]);

    if (!quantity || quantity <= 0) {
      toast.warning("Enter valid quantity");

      return;
    }

    if (quantity > product.quantity) {
      toast.warning("Not enough stock available");

      return;
    }

    const existingItem = billItems.find((item) => item.id === product.id);

    await axios.put(`${API}/update-stock/${product.id}`, {
      quantity: quantity,
    });

    if (existingItem) {
      const updatedBillItems = billItems.map((item) => {
        if (item.id === product.id) {
          const newQuantity = item.billQuantity + quantity;

          return {
            ...item,
            billQuantity: newQuantity,
            total: item.price * newQuantity,
          };
        }

        return item;
      });

      setBillItems(updatedBillItems);
    } else {
      const total = product.price * quantity;

      const item = {
        ...product,
        billQuantity: quantity,
        total: total,
      };

      setBillItems([...billItems, item]);
    }

    setQuantities({
      ...quantities,
      [product.id]: "",
    });

    fetchProducts();
  };

  // =========================================
  // REMOVE ITEM
  // =========================================

  const removeItem = async (index) => {
    const item = billItems[index];

    await axios.put(`${API}/restore-stock/${item.id}`, {
      quantity: item.billQuantity,
    });

    const updatedItems = [...billItems];

    updatedItems.splice(index, 1);

    setBillItems(updatedItems);

    fetchProducts();
  };

  // =========================================
  // INCREASE QUANTITY
  // =========================================

  const increaseQuantity = async (index) => {
    const updatedItems = [...billItems];

    const item = updatedItems[index];

    const product = products.find((p) => p.id === item.id);

    if (product.quantity <= 0) {
      toast.warning("No more stock available");

      return;
    }

    await axios.put(`${API}/update-stock/${item.id}`, {
      quantity: 1,
    });

    item.billQuantity += 1;

    item.total = item.billQuantity * item.price;

    setBillItems(updatedItems);

    fetchProducts();
  };

  // =========================================
  // DECREASE QUANTITY
  // =========================================

  const decreaseQuantity = async (index) => {
    const updatedItems = [...billItems];

    const item = updatedItems[index];

    if (item.billQuantity <= 1) {
      removeItem(index);

      return;
    }

    await axios.put(`${API}/restore-stock/${item.id}`, {
      quantity: 1,
    });

    item.billQuantity -= 1;

    item.total = item.billQuantity * item.price;

    setBillItems(updatedItems);

    fetchProducts();
  };

  // =========================================
  // FILTER PRODUCTS
  // =========================================

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.product_name.toLowerCase().includes(search.toLowerCase()) ||
      (product.category || "").toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      categoryFilter === "All" || product.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  // =========================================
  // CATEGORIES
  // =========================================

  const categories = [
    "All",
    ...new Set(products.map((product) => product.category)),
  ];

  // =========================================
  // TOTALS
  // =========================================

  const subTotal = billItems.reduce((total, item) => total + item.total, 0);

  const gstPercentage = 18;

  const gstAmount = (subTotal * gstPercentage) / 100;

  const finalTotal = subTotal + gstAmount;

  // =========================================
  // SAVE BILL
  // =========================================

  const saveBill = async () => {
    if (billItems.length === 0) {
      toast.warning("No items in bill ⚠");

      return;
    }

    const billData = {
      invoiceNumber: invoiceNumber,

      customerName: customerName,

      customerPhone: customerPhone,

      finalTotal: finalTotal,

      billDate: new Date().toISOString().split("T")[0],

      items: billItems,
    };

    try {
      await axios.post(`${API}/save-bill`, billData);

      toast.success("Bill Saved Successfully ✅");

      setBillItems([]);
    } catch (error) {
      toast.error("Failed to Save Bill ❌");
    }
  };

  // =========================================
  // DOWNLOAD PDF
  // =========================================

  const downloadInvoice = async () => {
    const input = document.getElementById("pdf-invoice");

    const canvas = await html2canvas(input, {
      scale: 2,
      useCORS: true,
    });

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");

    const pdfWidth = pdf.internal.pageSize.getWidth();

    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

    pdf.save(`${invoiceNumber}.pdf`);
  };

  const formatLastBought = (dateStr) => {
    if (!dateStr) return "previously";
    const days = Math.floor((Date.now() - new Date(dateStr)) / 86400000);
    if (days === 0) return "today";
    if (days === 1) return "yesterday";
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} week(s) ago`;
    return `${Math.floor(days / 30)} month(s) ago`;
  };

  return (
    <>
      {/* PDF TEMPLATE */}

      <div
        id="pdf-invoice"
        style={{
          position: "absolute",
          left: "-9999px",
          top: 0,
        }}
      >
        <InvoiceTemplate
          billItems={billItems}
          customerName={customerName}
          customerPhone={customerPhone}
          invoiceNumber={invoiceNumber}
          subTotal={subTotal}
          gstPercentage={gstPercentage}
          gstAmount={gstAmount}
          finalTotal={finalTotal}
        />
      </div>

      {/* AI POPUP */}

      {showPopup && recommendations.length > 0 && aiCustomer && (
        <div className="modal-overlay">
          <div className="modal-card">
            {/* Header */}
            <div
              style={{
                background: "#EAF3DE",
                borderRadius: "12px 12px 0 0",
                padding: "16px 18px",
                display: "flex",
                gap: 12,
                alignItems: "flex-start",
                margin: "-20px -20px 16px -20px",
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  background: "#3B6D11",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16,
                  flexShrink: 0,
                }}
              >
                ✦
              </div>
              <div>
                <h2
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: "#173404",
                    margin: 0,
                  }}
                >
                  Welcome back, {aiCustomer?.name?.split(" ")[0] || "Customer"}! 👋
                </h2>
                <p
                  style={{ fontSize: 12, color: "#3B6D11", margin: "3px 0 0" }}
                >
                  You've bought these before — add them again?
                </p>
              </div>
            </div>

            {/* Suggested Items */}
            {recommendations.map((item, index) => (
              <div className="recommend-card" key={index}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <div>
                    <h3 style={{ margin: "0 0 4px" }}>{item.product_name}</h3>
                    <p style={{ margin: 0, fontSize: 12, color: "#888" }}>
                      {item.category} · Bought {item.total_bought}× total
                    </p>
                    <p
                      style={{ margin: "3px 0 0", fontSize: 12, color: "#aaa" }}
                    >
                      Last purchased: {formatLastBought(item.last_bought)}
                    </p>
                  </div>
                  <p style={{ fontWeight: 700, fontSize: 14, margin: 0 }}>
                    ₹{parseFloat(item.price).toLocaleString("en-IN")}
                  </p>
                </div>
                <button
                  className="recommend-btn"
                  onClick={() => addRecommendedItem(item)}
                  style={{ marginTop: 10, width: "100%" }}
                >
                  + Add to Bill
                </button>
              </div>
            ))}

            {/* Footer */}
            <button
              onClick={() => setShowPopup(false)}
              style={{
                width: "100%",
                marginTop: 8,
                padding: "11px 0",
                background: "#1E3A1E",
                color: "#fff",
                border: "none",
                borderRadius: 9,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Continue Billing
            </button>
            <p
              style={{
                textAlign: "center",
                fontSize: 11,
                color: "#bbb",
                marginTop: 8,
                marginBottom: 0,
              }}
            >
              AI suggestion · based on purchase history
            </p>
          </div>
        </div>
      )}
      {/* MAIN PAGE */}

      <div className="create-bills-container">
        <h1 className="create-bills-title">Create Bill</h1>

        {/* CUSTOMER DETAILS */}

        <div
          className="bill-section"
          style={{
            marginBottom: "30px",
          }}
        >
          <h2 className="section-title">Customer Details</h2>

          <div className="input-group">
            <span className="input-icon">
              <FiUser />
            </span>

            <input
              type="text"
              placeholder="Customer Name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="quantity-input with-icon"
            />
          </div>

          <div
            className="input-group"
            style={{
              marginTop: "15px",
            }}
          >
            <span className="input-icon">
              <FiPhone />
            </span>

            <input
              type="text"
              placeholder="Phone Number"
              value={customerPhone}
              className="quantity-input with-icon"
              onChange={(e) => {
                const val = e.target.value;
                setCustomerPhone(val);
                if (val.length === 10) {
                  fetchRecommendations(val); // 👈 fires instantly at 10 digits
                }
              }}
              onBlur={() => {
                if (customerPhone.length === 10 && !aiLoading) {
                  fetchRecommendations(customerPhone);
                }
              }}
            />
          </div>
          {/* Loading indicator — shows while AI is fetching */}
          {aiLoading && (
            <p
              style={{
                fontSize: 12,
                color: "#3B6D11",
                marginTop: 6,
                marginLeft: 4,
              }}
            >
              ✦ Checking purchase history...
            </p>
          )}
        </div>

        {/* SEARCH */}

        <div
          className="bill-section"
          style={{
            marginBottom: "30px",
          }}
        >
          <h2 className="section-title">Search Products</h2>

          <div className="input-group">
            <span className="input-icon">
              <FiSearch />
            </span>

            <input
              type="text"
              placeholder="Search by name or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="quantity-input with-icon"
            />
          </div>

          <div
            className="input-group"
            style={{
              marginTop: "15px",
            }}
          >
            <span className="input-icon">
              <FiFilter />
            </span>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="quantity-input with-icon"
            >
              {categories.map((category, index) => (
                <option key={index} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* PRODUCTS */}

        <div className="products-grid">
          {filteredProducts.map((product) => (
            <div key={product.id} className="product-card">
              <h2 className="product-name">{product.product_name}</h2>

              <p className="product-info">
                <span className="info-label">Category:</span> {product.category}
              </p>

              <p className="product-info">
                <span className="info-label">Price:</span>₹ {product.price}
              </p>

              <p className="product-info">
                <span className="info-label">Stock:</span> {product.quantity}
              </p>

              {product.quantity === 0 ? (
                <p className="out-stock">
                  <FiXCircle
                    style={{
                      marginRight: "6px",
                      verticalAlign: "middle",
                    }}
                  />
                  Out of Stock
                </p>
              ) : product.quantity <= 5 ? (
                <p className="low-stock">
                  <FiAlertTriangle
                    style={{
                      marginRight: "6px",
                      verticalAlign: "middle",
                    }}
                  />
                  Low Stock
                </p>
              ) : null}

              <input
                type="number"
                placeholder="Enter Quantity"
                value={quantities[product.id] || ""}
                onChange={(e) =>
                  setQuantities({
                    ...quantities,
                    [product.id]: e.target.value,
                  })
                }
                className="quantity-input"
                style={{
                  marginTop: "12px",
                }}
              />

              <button
                className="add-bill-button"
                disabled={product.quantity === 0}
                onClick={() => addToBill(product)}
              >
                <FiPlusCircle
                  style={{
                    marginRight: "8px",
                    verticalAlign: "middle",
                  }}
                />

                {product.quantity === 0 ? "Out of Stock" : "Add to Bill"}
              </button>
            </div>
          ))}
        </div>

        {/* BILL SECTION */}

        <div className="bill-section">
          <div className="invoice-header">
            <div>
              <h1 className="shop-name">Billing Software</h1>

              <p>Smart Billing & Inventory System</p>
            </div>

            <div className="invoice-number">{invoiceNumber}</div>
          </div>

          <div className="invoice-details">
            <div className="invoice-card">
              <p>
                <strong>Customer</strong>
              </p>

              <p>{customerName || "—"}</p>
            </div>

            <div className="invoice-card">
              <p>
                <strong>Phone</strong>
              </p>

              <p>{customerPhone || "—"}</p>
            </div>

            <div className="invoice-card">
              <p>
                <strong>Date</strong>
              </p>

              <p>{new Date().toLocaleDateString()}</p>
            </div>
          </div>

          <hr />

          <h2 className="section-title">Bill Items</h2>

          {billItems.length === 0 ? (
            <p className="empty-bill">No items added yet.</p>
          ) : (
            billItems.map((item, index) => (
              <div key={index} className="bill-item">
                <div className="bill-item-header">
                  <h3>{item.product_name}</h3>

                  <button
                    className="delete-button remove-btn"
                    onClick={() => removeItem(index)}
                  >
                    <FiTrash2
                      style={{
                        marginRight: "5px",
                        verticalAlign: "middle",
                      }}
                    />
                    Remove
                  </button>
                </div>

                <div className="bill-item-details">
                  <p>
                    <span className="info-label">Category:</span>{" "}
                    {item.category}
                  </p>

                  <p>
                    <span className="info-label">Price:</span>₹ {item.price}
                  </p>

                  <div>
                    <span className="info-label">Quantity:</span>

                    <div className="quantity-controls">
                      <button
                        className="qty-btn"
                        onClick={() => decreaseQuantity(index)}
                      >
                        -
                      </button>

                      <span className="bill-quantity">{item.billQuantity}</span>

                      <button
                        className="qty-btn"
                        onClick={() => increaseQuantity(index)}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <p>
                    <span className="info-label">Total:</span>₹ {item.total}
                  </p>
                </div>
              </div>
            ))
          )}

          <div className="summary-section">
            <h2>Subtotal: ₹ {subTotal.toFixed(2)}</h2>

            <h2>
              GST ({gstPercentage}
              %): ₹ {gstAmount.toFixed(2)}
            </h2>

            <h1 className="final-amount">
              Final Total: ₹ {finalTotal.toFixed(2)}
            </h1>
          </div>

          <div className="bill-action-buttons">
            <button onClick={saveBill} className="add-bill-button">
              <FiSave
                style={{
                  marginRight: "8px",
                  verticalAlign: "middle",
                }}
              />
              Save Bill
            </button>

            <button
              onClick={downloadInvoice}
              className="add-bill-button print-btn"
            >
              <FiPrinter
                style={{
                  marginRight: "8px",
                  verticalAlign: "middle",
                }}
              />
              Download PDF
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateBill;
