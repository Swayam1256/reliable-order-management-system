
import { useState } from "react";

function OrderForm({ onOrderCreated }) {
  const [formData, setFormData] = useState({
    customerName: "",
    productName: "",
    quantity: 1,
    price: "",
    status: "pending",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const orderData = {
        ...formData,
        quantity: Number(formData.quantity),
        price: Number(formData.price),
      };

      await onOrderCreated(orderData);

      setFormData({
        customerName: "",
        productName: "",
        quantity: 1,
        price: "",
        status: "pending",
      });
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to create order"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="form-section">
      <h2>Create New Order</h2>

      {error && <p className="error">{error}</p>}

      <form onSubmit={handleSubmit} className="order-form">
        <input
          type="text"
          name="customerName"
          placeholder="Customer Name"
          value={formData.customerName}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="productName"
          placeholder="Product Name"
          value={formData.productName}
          onChange={handleChange}
          required
        />

        <input
          type="number"
          name="quantity"
          placeholder="Quantity"
          min="1"
          value={formData.quantity}
          onChange={handleChange}
          required
        />

        <input
          type="number"
          name="price"
          placeholder="Price"
          min="0"
          step="0.01"
          value={formData.price}
          onChange={handleChange}
          required
        />

        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
        >
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Order"}
        </button>
      </form>
    </section>
  );
}

export default OrderForm;
