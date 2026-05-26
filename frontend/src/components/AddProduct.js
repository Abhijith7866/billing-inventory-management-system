import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

import { FiBox, FiTag, FiDollarSign, FiHash } from "react-icons/fi";

import "./AddProduct.css";

const AddProduct = () => {
  // =========================================
  // STATES
  // =========================================

  const [productName, setProductName] = useState("");

  const [category, setCategory] = useState("");

  const [price, setPrice] = useState("");

  const [quantity, setQuantity] = useState(0);

  const [loading, setLoading] = useState(false);

  // =========================================
  // INCREASE / DECREASE QUANTITY
  // =========================================

  const increaseQty = () => {
    setQuantity((q) => q + 1);
  };

  const decreaseQty = () => {
    setQuantity((q) => (q > 0 ? q - 1 : 0));
  };

  // =========================================
  // ADD PRODUCT
  // =========================================

  const addProduct = async () => {
    if (!productName.trim() || !category.trim() || !price || !quantity) {
      toast.warning("Please fill all fields ⚠");
      return;
    }

    try {
      setLoading(true);

      await axios.post("https://billing-backend-sigma.vercel.app/add-product", {
        product_name: productName,
        category: category,
        price: price,
        quantity: quantity,
      });

      toast.success("Product Added Successfully ✅");

      setProductName("");
      setCategory("");
      setPrice("");
      setQuantity(0);
    } catch (error) {
      console.log("Add Product Error:", error);
      toast.error("Failed to Add Product ❌");
    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // UI
  // =========================================

  return (
    <div className="add-product-container">
      <div className="add-product-card">
        {/* TITLE */}
        <h1 className="add-product-title">Add Product</h1>

        {/* PRODUCT NAME */}
        <div className="input-group">
          <span className="input-icon">
            <FiBox />
          </span>
          <input
            type="text"
            placeholder="Product Name"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            className="add-product-input"
          />
        </div>

        {/* CATEGORY */}
        <div className="input-group">
          <span className="input-icon">
            <FiTag />
          </span>
          <input
            type="text"
            placeholder="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="add-product-input"
          />
        </div>

        {/* PRICE */}
        <div className="input-group">
          <span className="input-icon">
            <FiDollarSign />
          </span>
          <input
            type="number"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="add-product-input"
          />
        </div>

        {/* QUANTITY */}
        <div className="quantity-group">
          <span className="input-icon">
            <FiHash />
          </span>
          <span className="qty-label">Quantity</span>
          <button className="qty-btn" onClick={decreaseQty}>
            −
          </button>
          <span className="qty-value">{quantity}</span>
          <button className="qty-btn" onClick={increaseQty}>
            +
          </button>
        </div>

        {/* BUTTON */}
        <button
          onClick={addProduct}
          disabled={loading}
          className="add-product-button"
        >
          {loading ? "Adding Product..." : "Add Product"}
        </button>
      </div>
    </div>
  );
};

export default AddProduct;
