import { useEffect, useState } from "react";

import axios from "axios";

import { useNavigate } from "react-router-dom";

import {

    BarChart,

    Bar,

    XAxis,

    YAxis,

    CartesianGrid,

    Tooltip,

    ResponsiveContainer

} from "recharts";

import "./Dashboard.css";




const Dashboard = () => {

    const navigate = useNavigate();




    const [products, setProducts] = useState([]);

    const [bills, setBills] = useState([]);




    useEffect(() => {

        fetchProducts();

        fetchBills();

    }, []);




    // LOGOUT

    const logout = () => {

        localStorage.removeItem("username");

        navigate("/");

    };




    // FETCH PRODUCTS

    const fetchProducts = async () => {

        const response = await axios.get(

            "https://billing-software-production-dc60.up.railway.app/products"

        );




        setProducts(response.data);

    };




    // FETCH BILLS

    const fetchBills = async () => {

        const response = await axios.get(

            "https://billing-software-production-dc60.up.railway.app/bills"

        );




        setBills(response.data);

    };




    // TOTAL PRODUCTS

    const totalProducts =

        products.length;




    // TOTAL STOCK

    const totalStock = products.reduce(

        (total, product) =>

            total + product.quantity,

        0

    );




    // TOTAL BILLS

    const totalBills =

        bills.length;




    // TOTAL REVENUE

    const totalRevenue = bills.reduce(

        (total, bill) =>

            total + bill.final_total,

        0

    );




    // CHART DATA

    const chartData = bills.map((bill) => ({

        invoice:
            bill.invoice_number,

        revenue:
            bill.final_total

    }));




    return(

        <div className="dashboard-container">

            {/* NAVBAR */}

            <div className="dashboard-navbar">

                <button
                    onClick={() =>

                        navigate("/create-bills")

                    }
                    className="nav-button"
                >

                    Create Bill

                </button>




                <button
                    onClick={() =>

                        navigate("/add-product")

                    }
                    className="nav-button"
                >

                    Add Product

                </button>




                <button
                    onClick={() =>

                        navigate("/view-products")

                    }
                    className="nav-button"
                >

                    View Products

                </button>




                <button
                    onClick={logout}
                    className="logout-button"
                >

                    Logout

                </button>

            </div>




            {/* TITLE */}

            <h1 className="dashboard-title">

                Analytics Dashboard

            </h1>




            {/* DASHBOARD CARDS */}

            <div className="dashboard-cards">

                <div className="dashboard-card">

                    <h2>Total Products</h2>

                    <p>{totalProducts}</p>

                </div>




                <div className="dashboard-card">

                    <h2>Total Stock</h2>

                    <p>{totalStock}</p>

                </div>




                <div className="dashboard-card">

                    <h2>Total Bills</h2>

                    <p>{totalBills}</p>

                </div>




                <div className="dashboard-card">

                    <h2>Total Revenue</h2>

                    <p>

                        ₹ {totalRevenue.toFixed(2)}

                    </p>

                </div>

            </div>




            {/* CHART SECTION */}

            <div className="chart-section">

                <h2>

                    Revenue Analytics

                </h2>




                <ResponsiveContainer
                    width="100%"
                    height={400}
                >

                    <BarChart data={chartData}>

                        <CartesianGrid
                            strokeDasharray="3 3"
                        />

                        <XAxis dataKey="invoice" />

                        <YAxis />

                        <Tooltip />




                        <Bar
                            dataKey="revenue"
                            fill="#2563eb"
                            radius={[10,10,0,0]}
                        />

                    </BarChart>

                </ResponsiveContainer>

            </div>

        </div>

    );

};




export default Dashboard;