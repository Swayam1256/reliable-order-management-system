import { useEffect, useState } from "react";
import orderService from "./services/orderService";
import OrderForm from "./components/OrderForm";
import EditOrderForm from "./components/EditOrderForm";
import "./App.css";

function App() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingOrder, setEditingOrder] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await orderService.getAllOrders();
      setOrders(response.orders || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCreateOrder = async (orderData) => {
    await orderService.createOrder(orderData);
    await fetchOrders();
  };

  const totalOrders = orders.length;

  const pendingOrders = orders.filter(
    (order) => order.status === "pending",
  ).length;

  const completedOrders = orders.filter(
    (order) => order.status === "completed",
  ).length;

  const totalRevenue = orders.reduce(
    (total, order) => total + order.quantity * order.price,
    0,
  );

  const handleDeleteOrder = async (id) => {
    try {
      const confirmed = window.confirm(
        "Are you sure you want to delete this order?",
      );

      if (!confirmed) return;

      await orderService.deleteOrder(id);
      await fetchOrders();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to delete order");
    }
  };
  const handleUpdateOrder = async (id, orderData) => {
    await orderService.updateOrder(id, orderData);

    setEditingOrder(null);
    await fetchOrders();
  };

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>Order Management</h1>
          <p>Manage and monitor your orders</p>
        </div>

        <button onClick={fetchOrders} className="refresh-btn">
          Refresh Orders
        </button>
      </header>

      <main className="dashboard">
        <section className="stats-grid">
          <div className="stat-card">
            <h3>Total Orders</h3>
            <h2>{totalOrders}</h2>
          </div>

          <div className="stat-card">
            <h3>Pending Orders</h3>
            <h2>{pendingOrders}</h2>
          </div>

          <div className="stat-card">
            <h3>Completed Orders</h3>
            <h2>{completedOrders}</h2>
          </div>

          <div className="stat-card">
            <h3>Total Order Value</h3>
            <h2>₹{totalRevenue.toLocaleString("en-IN")}</h2>
          </div>
        </section>

        {editingOrder ? (
          <EditOrderForm
            order={editingOrder}
            onOrderUpdated={handleUpdateOrder}
            onCancel={() => setEditingOrder(null)}
          />
        ) : (
          <OrderForm onOrderCreated={handleCreateOrder} />
        )}

        <section className="orders-section">
          <div className="section-header">
            <h2>Recent Orders</h2>
            <span>{totalOrders} orders</span>
          </div>

          {loading && <p>Loading orders...</p>}
          {error && <p className="error">{error}</p>}

          {!loading && !error && orders.length === 0 && <p>No orders found.</p>}

          {!loading && orders.length > 0 && (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {orders.map((order) => (
                    <tr key={order._id}>
                      <td>{order.customerName}</td>
                      <td>{order.productName}</td>
                      <td>{order.quantity}</td>
                      <td>₹{order.price.toLocaleString("en-IN")}</td>
                      <td>
                        <span className={`status ${order.status}`}>
                          {order.status}
                        </span>
                      </td>

                      <td>
                        <button
                          className="edit-btn"
                          onClick={() => setEditingOrder(order)}
                        >
                          Edit
                        </button>

                        <button
                          className="delete-btn"
                          onClick={() => handleDeleteOrder(order._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
