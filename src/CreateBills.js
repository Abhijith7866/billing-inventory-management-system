import { useEffect, useRef, useState } from "react";

import axios from "axios";

import html2canvas from "html2canvas";

import jsPDF from "jspdf";

import "./CreateBills.css";




const CreateBill = () => {

    const invoiceRef = useRef();




    const [products, setProducts] = useState([]);

    const [billItems, setBillItems] = useState([]);

    const [quantities, setQuantities] = useState({});

    const [customerName, setCustomerName] = useState("");

    const [customerPhone, setCustomerPhone] = useState("");

    const [search, setSearch] = useState("");

    const [categoryFilter, setCategoryFilter] =
        useState("All");




    // INVOICE NUMBER

    const invoiceNumber =

        "INV-" +

        Math.floor(Math.random() * 10000);




    useEffect(() => {

        fetchProducts();

    }, []);




    // FETCH PRODUCTS

    const fetchProducts = async () => {

        const response = await axios.get(

            "https://billing-software-production-dc60.up.railway.app/products"

        );




        setProducts(response.data);

    };




    // ADD TO BILL

    const addToBill = async (product) => {

        const quantity =

            Number(quantities[product.id]);




        if(!quantity || quantity <= 0){

            alert("Enter valid quantity");

            return;

        }




        if(quantity > product.quantity){

            alert("Not enough stock available");

            return;

        }




        // UPDATE STOCK

        await axios.put(

            `https://billing-software-production-dc60.up.railway.app/update-stock/${product.id}`,

            {
                quantity: quantity
            }

        );




        const total =

            product.price * quantity;




        const item = {

            ...product,

            billQuantity: quantity,

            total: total

        };




        setBillItems([...billItems, item]);




        fetchProducts();

    };




    // REMOVE ITEM

    const removeItem = async (index) => {

        const item =
            billItems[index];




        // RESTORE STOCK

        await axios.put(

            `https://billing-software-production-dc60.up.railway.app/restore-stock/${item.id}`,

            {
                quantity: item.billQuantity
            }

        );




        const updatedItems =
            [...billItems];




        updatedItems.splice(index, 1);




        setBillItems(updatedItems);




        fetchProducts();

    };




    // FILTER PRODUCTS

    const filteredProducts = products.filter((product) => {

        const matchesSearch =

            product.product_name
            .toLowerCase()
            .includes(search.toLowerCase())

            ||

            (product.category || "")
            .toLowerCase()
            .includes(search.toLowerCase());




        const matchesCategory =

            categoryFilter === "All"

            ||

            product.category === categoryFilter;




        return(

            matchesSearch && matchesCategory

        );

    });




    // UNIQUE CATEGORIES

    const categories = [

        "All",

        ...new Set(

            products.map(

                (product) => product.category

            )

        )

    ];




    // SUBTOTAL

    const subTotal = billItems.reduce(

        (total, item) =>

            total + item.total,

        0

    );




    // GST

    const gstPercentage = 18;




    const gstAmount =

        (subTotal * gstPercentage) / 100;




    // FINAL TOTAL

    const finalTotal =

        subTotal + gstAmount;




    // SAVE BILL

    const saveBill = async () => {

        if(billItems.length === 0){

            alert("No items in bill");

            return;

        }




        const billData = {

            invoiceNumber: invoiceNumber,

            customerName: customerName,

            customerPhone: customerPhone,

            finalTotal: finalTotal,

            billDate:
                new Date().toLocaleDateString(),

            items: billItems

        };




        const response = await axios.post(

            "https://billing-software-production-dc60.up.railway.app/save-bill",

            billData

        );




        alert(response.data);




        setBillItems([]);

    };




    // DOWNLOAD PDF

    const downloadPDF = async () => {

    const input = invoiceRef.current;




    const canvas = await html2canvas(input, {

        scale:2

    });




    const imgData =

        canvas.toDataURL("image/png");




    const pdf =

        new jsPDF("p", "mm", "a4");




    const pageWidth = 210;

    const pageHeight = 297;




    const imgWidth = pageWidth;

    const imgHeight =

        (canvas.height * imgWidth)
        / canvas.width;




    let heightLeft = imgHeight;

    let position = 0;




    pdf.addImage(

        imgData,

        "PNG",

        0,

        position,

        imgWidth,

        imgHeight

    );




    heightLeft -= pageHeight;




    while(heightLeft > 0){

        position = heightLeft - imgHeight;




        pdf.addPage();




        pdf.addImage(

            imgData,

            "PNG",

            0,

            position,

            imgWidth,

            imgHeight

        );




        heightLeft -= pageHeight;

    }




    pdf.save(`${invoiceNumber}.pdf`);

};



    return(

        <div className="create-bills-container">

            <h1 className="create-bills-title">

                Create Bill

            </h1>




            {/* CUSTOMER DETAILS */}

            <div
                className="bill-section"
                style={{
                    marginBottom:"30px"
                }}
            >

                <h2>Customer Details</h2>




                <input
                    type="text"
                    placeholder="Customer Name"
                    value={customerName}
                    onChange={(e)=>

                        setCustomerName(e.target.value)

                    }
                    className="quantity-input"
                />




                <input
                    type="text"
                    placeholder="Phone Number"
                    value={customerPhone}
                    onChange={(e)=>

                        setCustomerPhone(e.target.value)

                    }
                    className="quantity-input"
                    style={{
                        marginTop:"15px"
                    }}
                />

            </div>




            {/* SEARCH */}

            <input
                type="text"
                placeholder="Search Product..."
                value={search}
                onChange={(e)=>

                    setSearch(e.target.value)

                }
                className="quantity-input"
                style={{
                    marginBottom:"20px"
                }}
            />




            {/* CATEGORY FILTER */}

            <select
                value={categoryFilter}
                onChange={(e)=>

                    setCategoryFilter(e.target.value)

                }
                className="quantity-input"
                style={{
                    marginBottom:"30px"
                }}
            >

                {
                    categories.map((category, index) => (

                        <option
                            key={index}
                            value={category}
                        >

                            {category}

                        </option>

                    ))
                }

            </select>




            {/* PRODUCTS GRID */}

            <div className="products-grid">

                {
                    filteredProducts.map((product) => (

                        <div
                            key={product.id}
                            className="product-card"
                        >

                            <h2 className="product-name">

                                {product.product_name}

                            </h2>




                            <p className="product-info">

                                Category :
                                {product.category}

                            </p>




                            <p className="product-info">

                                Price :
                                ₹ {product.price}

                            </p>




                            <p className="product-info">

                                Stock :
                                {product.quantity}

                            </p>




                            {
                                product.quantity === 0 ? (

                                    <p className="out-stock">

                                        ❌ Out Of Stock

                                    </p>

                                ) : product.quantity <= 5 ? (

                                    <p className="low-stock">

                                        ⚠ Low Stock

                                    </p>

                                ) : null
                            }




                            <input
                                type="number"
                                placeholder="Enter Quantity"
                                value={
                                    quantities[product.id] || ""
                                }
                                onChange={(e)=>

                                    setQuantities({

                                        ...quantities,

                                        [product.id]:
                                        e.target.value

                                    })

                                }
                                className="quantity-input"
                            />




                            <button
                                className="add-bill-button"

                                disabled={
                                    product.quantity === 0
                                }

                                onClick={() =>

                                    addToBill(product)

                                }
                            >

                                {
                                    product.quantity === 0

                                    ?

                                    "Out Of Stock"

                                    :

                                    "Add To Bill"
                                }

                            </button>

                        </div>

                    ))
                }

            </div>




            {/* INVOICE SECTION */}

            <div
                className="bill-section"
                ref={invoiceRef}
            >

                <div className="invoice-header">

                    <div>

                        <h1 className="shop-name">

                            Billing Software

                        </h1>

                        <p>

                            Smart Billing &
                            Inventory System

                        </p>

                    </div>




                    <div className="invoice-number">

                        {invoiceNumber}

                    </div>

                </div>




                <div className="invoice-details">

                    <div className="invoice-card">

                        <p>
                            <strong>Customer</strong>
                        </p>

                        <p>{customerName}</p>

                    </div>




                    <div className="invoice-card">

                        <p>
                            <strong>Phone</strong>
                        </p>

                        <p>{customerPhone}</p>

                    </div>




                    <div className="invoice-card">

                        <p>
                            <strong>Date</strong>
                        </p>

                        <p>

                            {
                                new Date()
                                .toLocaleDateString()
                            }

                        </p>

                    </div>

                </div>




                <hr />




                <h2>Bill Items</h2>

                {
                    billItems.map((item, index) => (

                        <div
                            key={index}
                            className="bill-item"
                        >

                            <h3>

                                {item.product_name}

                            </h3>

                            <p>

                                Category :
                                {item.category}

                            </p>

                            <p>

                                Price :
                                ₹ {item.price}

                            </p>

                            <p>

                                Quantity :
                                {item.billQuantity}

                            </p>

                            <p>

                                Total :
                                ₹ {item.total}

                            </p>




                            <button
                                className="delete-button"
                                onClick={() =>

                                    removeItem(index)

                                }
                            >

                                Remove

                            </button>

                        </div>

                    ))
                }




                <div className="summary-section">

                    <h2>

                        Subtotal :
                        ₹ {subTotal.toFixed(2)}

                    </h2>




                    <h2>

                        GST ({gstPercentage}%)
                        :
                        ₹ {gstAmount.toFixed(2)}

                    </h2>




                    <h1 className="final-amount">

                        Final Total :
                        ₹ {finalTotal.toFixed(2)}

                    </h1>

                </div>

            </div>




            <button
                onClick={saveBill}
                className="add-bill-button"
                style={{
                    marginTop:"20px"
                }}
            >

                Save Bill

            </button>




            <button
                onClick={() => window.print()}
                className="add-bill-button"
                style={{
                    marginTop:"20px"
                }}
            >

                Print Invoice

            </button>




            <button
                onClick={downloadPDF}
                className="add-bill-button"
                style={{
                    marginTop:"20px"
                }}
            >

                Download PDF

            </button>

        </div>

    );

};




export default CreateBill;