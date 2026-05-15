import { useState } from "react";
import axios from "axios";
import "./AddProduct.css";

const AddProduct = () => {

    const [productName, setProductName] = useState("");

    const [category, setCategory] = useState("");

    const [price, setPrice] = useState("");

    const [quantity, setQuantity] = useState("");




    const addProduct = async () => {

        if(

            !productName ||

            !category ||

            !price ||

            !quantity

        ){

            alert("Please fill all fields");

            return;

        }




        const response = await axios.post(

            "https://billing-software-production-dc60.up.railway.app/add-product",

            {

                product_name: productName,

                category: category,

                price: price,

                quantity: quantity

            }

        );




        alert(response.data);




        setProductName("");

        setCategory("");

        setPrice("");

        setQuantity("");

    };




    return(

        <div className="add-product-container">

            <div className="add-product-card">

                <h1>Add Product</h1>




                <input
                    type="text"
                    placeholder="Product Name"
                    value={productName}
                    onChange={(e)=>

                        setProductName(e.target.value)

                    }
                />




                <input
                    type="text"
                    placeholder="Category"
                    value={category}
                    onChange={(e)=>

                        setCategory(e.target.value)

                    }
                />




                <input
                    type="number"
                    placeholder="Price"
                    value={price}
                    onChange={(e)=>

                        setPrice(e.target.value)

                    }
                />




                <input
                    type="number"
                    placeholder="Quantity"
                    value={quantity}
                    onChange={(e)=>

                        setQuantity(e.target.value)

                    }
                />




                <button onClick={addProduct}>

                    Add Product

                </button>

            </div>

        </div>

    );

}

export default AddProduct;