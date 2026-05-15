import { useEffect, useState } from "react";

import axios from "axios";

import "./ViewProducts.css";




const ViewProducts = () => {

    const [products, setProducts] = useState([]);

    const [editId, setEditId] = useState(null);

    const [editName, setEditName] = useState("");

    const [editPrice, setEditPrice] = useState("");

    const [editQuantity, setEditQuantity] = useState("");




    useEffect(() => {

        fetchProducts();

    }, []);




    const fetchProducts = async () => {

        const response = await axios.get(

            "https://billing-software-production-dc60.up.railway.app/products"

        );

        setProducts(response.data);

    };




    const deleteProduct = async (id) => {

        await axios.delete(

            `https://billing-software-production-dc60.up.railway.app/delete-product/${id}`

        );

        fetchProducts();

    };




    const updateProduct = async () => {

        await axios.put(

            `https://billing-software-production-dc60.up.railway.app/update-product/${editId}`,

            {
                product_name: editName,
                price: editPrice,
                quantity: editQuantity
            }

        );

        fetchProducts();

        setEditId(null);

    };




    return(

        <div className="view-products-container">

            <div className="view-products-card">

                <h1 className="view-products-title">
                    All Products
                </h1>




                {
                    editId && (

                        <div className="edit-form">

                            <input
                                type="text"
                                value={editName}
                                onChange={(e)=>setEditName(e.target.value)}
                                placeholder="Product Name"
                                className="edit-input"
                            />




                            <input
                                type="number"
                                value={editPrice}
                                onChange={(e)=>setEditPrice(e.target.value)}
                                placeholder="Price"
                                className="edit-input"
                            />




                            <input
                                type="number"
                                value={editQuantity}
                                onChange={(e)=>setEditQuantity(e.target.value)}
                                placeholder="Quantity"
                                className="edit-input"
                            />




                            <button
                                onClick={updateProduct}
                                className="update-button"
                            >

                                Update Product

                            </button>

                        </div>

                    )
                }




                <table className="products-table">

                    <thead>

                        <tr>

                            <th>ID</th>
                            <th>Product Name</th>
                            <th>Price</th>
                            <th>Quantity</th>
                            <th>Action</th>

                        </tr>

                    </thead>




                    <tbody>

                        {
                            products.map((product) => (

                                <tr key={product.id}>

                                    <td>{product.id}</td>

                                    <td>{product.product_name}</td>

                                    <td>{product.price}</td>

                                    <td>{product.quantity}</td>




                                    <td>

                                        <button
                                            className="delete-button"
                                            onClick={() =>
                                                deleteProduct(product.id)
                                            }
                                        >
                                            Delete
                                        </button>




                                        <button
                                            className="edit-button"
                                            onClick={() => {

                                                setEditId(product.id);

                                                setEditName(product.product_name);

                                                setEditPrice(product.price);

                                                setEditQuantity(product.quantity);

                                            }}
                                        >
                                            Edit
                                        </button>

                                    </td>

                                </tr>

                            ))
                        }

                    </tbody>

                </table>

            </div>

        </div>

    );

}

export default ViewProducts;