
import { useState } from "react";

function EditOrderForm({ order, onOrderUpdated, onCancel }) {
  const [formData, setFormData] = useState({
    customerName: order.customerName,
    productName: order.productName,
    quantity: order.quantity,
    price: order.price,
    status: order.status,
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

      await onOrderUpdated(order._id, {
        ...formData,
        quantity: Number(formData.quantity),
        price: Number(formData.price),
      });
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to update order"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="form-section">
      <h2>Edit Order</h2>

      {error && <p className="error">{error}</p>}

      <form onSubmit={handleSubmit} className="order-form">
        <input
          name="customerName"
          value={formData.customerName}
          onChange={handleChange}
          placeholder="Customer Name"
          required
        />

        <input
          name="productName"
          value={formData.productName}
          onChange={handleChange}
          placeholder="Product Name"
          required
        />

        <input
          type="number"
          name="quantity"
          min="1"
          value={formData.quantity}
          onChange={handleChange}
          required
        />

        <input
          type="number"
          name="price"
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
          {loading ? "Updating..." : "Update Order"}
        </button>

        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      </form>
    </section>
  );
}

export default EditOrderForm;
