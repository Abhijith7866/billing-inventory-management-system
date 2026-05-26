import { useEffect, useState } from "react";

import axios from "axios";

import { ToastContainer, toast } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";

import "./ViewProducts.css";

function ViewProducts() {
  const API = "https://billing-backend-sigma.vercel.app";

  const [products, setProducts] = useState([]);

  const [search, setSearch] = useState("");

  const [editingId, setEditingId] = useState(null);

  const [editData, setEditData] = useState({
    product_name: "",
    category: "",
    price: "",
    quantity: "",
  });

  // =========================================
  // FILTER PRODUCTS
  // =========================================

  const filteredProducts = products.filter(
    (product) =>
      product.product_name.toLowerCase().includes(search.toLowerCase()) ||
      product.category.toLowerCase().includes(search.toLowerCase()),
  );

  // =========================================
  // FETCH PRODUCTS
  // =========================================

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API}/products`);

      setProducts(res.data);
    } catch (err) {
      console.log(err);

      toast.error("Failed to fetch products");
    }
  };

  // =========================================
  // DELETE PRODUCT
  // =========================================

  const deleteProduct = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?",
    );

    if (!confirmed) return;

    try {
      await axios.delete(`${API}/delete-product/${id}`);

      toast.success("Product Deleted Successfully");

      fetchProducts();
    } catch (err) {
      console.log(err);

      toast.error("Delete Failed");
    }
  };

  // =========================================
  // START EDIT
  // =========================================

  const startEdit = (product) => {
    setEditingId(product.id);

    setEditData({
      product_name: product.product_name,
      category: product.category,
      price: product.price,
      quantity: product.quantity,
    });
  };

  // =========================================
  // UPDATE PRODUCT
  // =========================================

  const updateProduct = async (id) => {
    try {
      await axios.put(`${API}/update-product/${id}`, editData);

      toast.success("Product Updated Successfully");

      setEditingId(null);

      fetchProducts();
    } catch (err) {
      console.log(err);

      toast.error("Update Failed");
    }
  };

  // =========================================
  // USE EFFECT
  // =========================================

  useEffect(() => {
    fetchProducts();
  }, []);

  // =========================================
  // UI
  // =========================================

  return (
    <div className="view-products-container">
      <div className="view-products-card">
        <h1 className="view-products-title">View Products</h1>

        {/* =========================================
            TOP BAR
        ========================================= */}

        <div className="top-bar">
          <p className="product-count">
            Showing {filteredProducts.length}
            {filteredProducts.length === 1 ? " product" : " products"}
          </p>

          <div className="search-bar-container">
            <span className="search-icon">🔍</span>

            <input
              type="text"
              placeholder="Search products or category..."
              className="search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* =========================================
            TABLE
        ========================================= */}

        <div className="table-wrapper">
          <table className="products-table">
            <thead>
              <tr>
                <th>ID</th>

                <th>Product Name</th>

                <th>Category</th>

                <th>Price</th>

                <th>Quantity</th>

                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="no-products">
                    No products found
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id}>
                    {/* ID */}
                    <td>{product.id}</td>

                    {/* PRODUCT NAME */}
                    <td>
                      {editingId === product.id ? (
                        <input
                          className="edit-input"
                          value={editData.product_name}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              product_name: e.target.value,
                            })
                          }
                        />
                      ) : (
                        product.product_name
                      )}
                    </td>

                    {/* CATEGORY */}
                    <td>
                      {editingId === product.id ? (
                        <input
                          className="edit-input"
                          value={editData.category}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              category: e.target.value,
                            })
                          }
                        />
                      ) : (
                        product.category
                      )}
                    </td>

                    {/* PRICE */}
                    <td>
                      {editingId === product.id ? (
                        <input
                          className="edit-input"
                          value={editData.price}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              price: e.target.value,
                            })
                          }
                        />
                      ) : (
                        `₹ ${product.price}`
                      )}
                    </td>

                    {/* QUANTITY */}
                    <td>
                      {editingId === product.id ? (
                        <input
                          className="edit-input"
                          value={editData.quantity}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              quantity: e.target.value,
                            })
                          }
                        />
                      ) : (
                        <span
                          className={
                            product.quantity <= 5
                              ? "stock-low"
                              : product.quantity <= 20
                                ? "stock-medium"
                                : "stock-high"
                          }
                        >
                          {product.quantity}
                        </span>
                      )}
                    </td>

                    {/* ACTION BUTTONS */}
                    <td>
                      <div className="action-buttons">
                        {editingId === product.id ? (
                          <button
                            className="save-btn"
                            onClick={() => updateProduct(product.id)}
                          >
                            Save
                          </button>
                        ) : (
                          <button
                            className="edit-btn"
                            onClick={() => startEdit(product)}
                          >
                            Edit
                          </button>
                        )}

                        <button
                          className="delete-btn"
                          onClick={() => deleteProduct(product.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================================
          TOAST NOTIFICATIONS
      ========================================= */}

      <ToastContainer position="top-right" autoClose={2000} theme="dark" />
    </div>
  );
}

export default ViewProducts;
