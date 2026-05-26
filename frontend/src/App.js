import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";

import { ToastContainer } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";

import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import AddProduct from "./components/AddProduct";
import ViewProducts from "./components/ViewProducts";
import CreateBills from "./components/CreateBills";
import Sidebar from "./components/Sidebar";
import BillDetails from "./components/BillDetails";

import "./App.css";

const noSidebarRoutes = ["/", "/register"];

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/" />;
  }
  return children;
};

const Layout = ({ children }) => {
  const location = useLocation();
  const showSidebar = !noSidebarRoutes.includes(location.pathname);

  return (
    <div className="app-layout">
      {showSidebar && <Sidebar />}
      <div className={showSidebar ? "main-content" : "full-content"}>
        {children}
      </div>
    </div>
  );
};


function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/add-product"
            element={
              <ProtectedRoute>
                <AddProduct />
              </ProtectedRoute>
            }
          />
          <Route
            path="/view-products"
            element={
              <ProtectedRoute>
                <ViewProducts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-bills"
            element={
              <ProtectedRoute>
                <CreateBills />
              </ProtectedRoute>
            }
          />
          <Route path="/bill-details/:id" element={<BillDetails />} />
        </Routes>
      </Layout>
      <ToastContainer position="bottom-right" autoClose={3000} theme="dark" />
    </BrowserRouter>
  );
}

export default App;
