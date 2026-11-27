
const API_URL = 'http://localhost:5000/api';

// Owner Login
export const ownerLogin = async (password) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ password })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Login failed.');
  }

  return data;
};

// Get All Products
export const getProducts = async () => {
  const response = await fetch(`${API_URL}/products`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Could not load products.');
  }

  return data;
};

// Add Product
export const addProduct = async (formData, token) => {
  const response = await fetch(`${API_URL}/products`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: formData
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Could not add product.');
  }

  return data;
};

// Edit Product
export const updateProduct = async (id, formData, token) => {
  const response = await fetch(`${API_URL}/products/${id}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: formData
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Could not update product.');
  }

  return data;
};

// Delete Product
export const deleteProduct = async (id, token) => {
  const response = await fetch(`${API_URL}/products/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Could not delete product.');
  }

  return data;
};
