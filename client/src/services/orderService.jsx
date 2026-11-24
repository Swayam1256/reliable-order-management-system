
import axios from "axios";

const API_URL = "http://localhost:5000/api/orders";

const orderService = {
  getAllOrders: async () => {
    const response = await axios.get(API_URL);
    return response.data;
  },

  getOrderById: async (id) => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  },

  createOrder: async (orderData) => {
    const response = await axios.post(API_URL, orderData);
    return response.data;
  },

  updateOrder: async (id, orderData) => {
    const response = await axios.put(`${API_URL}/${id}`, orderData);
    return response.data;
  },

  deleteOrder: async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  },
};

export default orderService;
