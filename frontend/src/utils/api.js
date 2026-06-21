import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://ziatradersandco-i0rt.onrender.com/api',
  withCredentials: true,
});

const TOKEN_KEY = 'ziatraders_token';
const USER_KEY = 'ziatraders_user';

export const getStoredToken = () =>
  localStorage.getItem(TOKEN_KEY) || localStorage.getItem('agromart_token');

export const getStoredUser = () => {
  const raw = localStorage.getItem(USER_KEY) || localStorage.getItem('agromart_user');
  return raw ? JSON.parse(raw) : null;
};

API.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem('agromart_token');
      localStorage.removeItem('agromart_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default API;
export { TOKEN_KEY, USER_KEY };

export const authAPI = {
  register:        (data) => API.post('/auth/register', data),
  login:           (data) => API.post('/auth/login', data),
  logout:          ()     => API.post('/auth/logout'),
  getMe:           ()     => API.get('/auth/me'),
  updatePassword:  (data) => API.put('/auth/update-password', data),
};

export const productAPI = {
  getAll:        (params) => API.get('/products', { params }),
  getFeatured:   ()       => API.get('/products/featured'),
  getLatest:     ()       => API.get('/products/latest'),
  getBestSellers:()       => API.get('/products/bestsellers'),
  getOne:        (id)     => API.get(`/products/${id}`),
  create:        (data)   => API.post('/products', data),
  update:        (id, d)  => API.put(`/products/${id}`, d),
  delete:        (id)     => API.delete(`/products/${id}`),
};

export const categoryAPI = {
  getAll:  ()     => API.get('/categories'),
  create:  (data) => API.post('/categories', data),
  update:  (id, d) => API.put(`/categories/${id}`, d),
  delete:  (id)   => API.delete(`/categories/${id}`),
};

export const cartAPI = {
  get:    ()               => API.get('/cart'),
  add:    (productId, qty) => API.post('/cart/add', { productId, quantity: qty }),
  update: (productId, qty) => API.put(`/cart/update/${productId}`, { quantity: qty }),
  remove: (productId)      => API.delete(`/cart/remove/${productId}`),
  clear:  ()               => API.delete('/cart/clear'),
};

export const orderAPI = {
  create:       (data) => API.post('/orders', data),
  getMy:        ()     => API.get('/orders/my'),
  getOne:       (id)   => API.get(`/orders/${id}`),
  updateStatus: (id, d) => API.put(`/orders/${id}/status`, d),
  cancel:       (id, d) => API.put(`/orders/${id}/cancel`, d),
};

export const reviewAPI = {
  getByProduct: (pid) => API.get(`/reviews/product/${pid}`),
  create:       (d)   => API.post('/reviews', d),
  delete:       (id)  => API.delete(`/reviews/${id}`),
};

export const userAPI = {
  getProfile:      ()       => API.get('/users/profile'),
  updateProfile:   (d)      => API.put('/users/profile', d),
  addAddress:      (d)      => API.post('/users/addresses', d),
  deleteAddress:   (id)     => API.delete(`/users/addresses/${id}`),
  toggleWishlist:  (pid)    => API.post(`/users/wishlist/${pid}`),
};

export const sellerAPI = {
  createShop:   (d) => API.post('/sellers/shop', d),
  getMyShop:    ()  => API.get('/sellers/shop'),
  getProducts:  ()  => API.get('/sellers/products'),
  getOrders:    ()  => API.get('/sellers/orders'),
};

export const adminAPI = {
  getUsers:       (params) => API.get('/admin/users', { params }),
  createUser:     (d)      => API.post('/admin/users', d),
  updateUser:     (id, d)  => API.put(`/admin/users/${id}`, d),
  deleteUser:     (id)     => API.delete(`/admin/users/${id}`),
  toggleUser:     (id)     => API.put(`/admin/users/${id}/toggle`),
  getProducts:    (params) => API.get('/admin/products', { params }),
  getOrders:      ()       => API.get('/admin/orders'),
  approveProduct: (id)     => API.put(`/admin/products/${id}/approve`),
  getShops:       ()       => API.get('/admin/shops'),
  approveShop:    (id)     => API.put(`/admin/shops/${id}/approve`),
  getAppointments:()       => API.get('/agronomist/appointments/all'),
};

export const cmsAPI = {
  getAll:    ()       => API.get('/cms'),
  getOne:    (slug)   => API.get(`/cms/${slug}`),
  getAdmin:  ()       => API.get('/cms/admin/all'),
  update:    (slug, d) => API.put(`/cms/${slug}`, d),
};

export const queryAPI = {
  create:   (d)      => API.post('/queries', d),
  getMy:    ()        => API.get('/queries/my'),
  respond:  (id, d)   => API.put(`/queries/${id}/respond`, d),
  assign:   (id, d)   => API.put(`/queries/${id}/assign`, d),
  setStatus:(id, d)   => API.put(`/queries/${id}/status`, d),
  delete:   (id)      => API.delete(`/queries/${id}`),
};

export const warehouseAPI = {
  getAll: () => API.get('/warehouses'),
  create: (d) => API.post('/warehouses', d),
  update: (id, d) => API.put(`/warehouses/${id}`, d),
  delete: (id) => API.delete(`/warehouses/${id}`),
};

export const staffAPI = {
  getAll: () => API.get('/staff'),
  create: (d) => API.post('/staff', d),
  update: (id, d) => API.put(`/staff/${id}`, d),
  delete: (id) => API.delete(`/staff/${id}`),
};

export const expenseAPI = {
  getAll: () => API.get('/expenses'),
  create: (d) => API.post('/expenses', d),
  update: (id, d) => API.put(`/expenses/${id}`, d),
  delete: (id) => API.delete(`/expenses/${id}`),
};

export const financeAPI = {
  getSummary: () => API.get('/finance/summary'),
  getAll: () => API.get('/finance'),
  create: (d) => API.post('/finance', d),
  update: (id, d) => API.put(`/finance/${id}`, d),
  delete: (id) => API.delete(`/finance/${id}`),
};

export const logisticsAPI = {
  getAll: () => API.get('/logistics'),
  create: (d) => API.post('/logistics', d),
  update: (id, d) => API.put(`/logistics/${id}`, d),
  updateStatus: (id, d) => API.put(`/logistics/${id}/status`, d),
  delete: (id) => API.delete(`/logistics/${id}`),
};

export const inventoryAPI = {
  getLogs: () => API.get('/inventory/logs'),
  getSummary: (lowStockThreshold = 10) => API.get('/inventory/summary', { params: { lowStockThreshold } }),
  adjust: (d) => API.post('/inventory/adjust', d),
};

export const analyticsAPI = {
  admin:  () => API.get('/analytics/admin'),
  seller: () => API.get('/analytics/seller'),
};

export const notifAPI = {
  getAll:   ()   => API.get('/notifications'),
  readAll:  ()   => API.put('/notifications/read-all'),
  readOne:  (id) => API.put(`/notifications/${id}/read`),
};

export const chatAPI = {
  getMy:      ()          => API.get('/chat/my'),
  start:      (rid, type) => API.post('/chat/start', { recipientId: rid, type }),
  getMessages:(chatId)    => API.get(`/chat/${chatId}/messages`),
};

export const prescriptionAPI = {
  create: (d) => API.post('/prescriptions', d),
  getMy:  ()  => API.get('/prescriptions/my'),
};

export const couponAPI = {
  validate: (code, total) => API.post('/coupons/validate', { code, orderTotal: total }),
  getAll:   ()             => API.get('/coupons'),
  create:   (d)            => API.post('/coupons', d),
  delete:   (id)           => API.delete(`/coupons/${id}`),
};

export const blogAPI = {
  getAll:  ()     => API.get('/blog'),
  getOne:  (slug) => API.get(`/blog/${slug}`),
  create:  (d)    => API.post('/blog', d),
};

export const agronomistAPI = {
  getList:            ()  => API.get('/agronomist/list'),
  bookConsultation:   (d) => API.post('/agronomist/consult', d),
  getConsultations:   ()  => API.get('/agronomist/consultations'),
  updateConsultation: (id, d) => API.put(`/agronomist/consultations/${id}/status`, d),
};

export const invoiceAPI = {
  get: (orderId) => API.get(`/invoices/${orderId}`),
};

export const paymentAPI = {
  initiate: (d) => API.post('/payments/initiate', d),
};