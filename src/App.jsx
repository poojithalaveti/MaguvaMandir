
import { useEffect, useState } from 'react';
import './App.css';

import {
  ownerLogin,
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct
} from './api';

const availableSizes = ['M', 'L', 'XL', '2XL', '3XL'];

const emptyForm = {
  name: '',
  clothCode: '',
  price: '',
  offerPrice: '',
  sizes: [],
  fabric: ''
};

// PRODUCT CARD
function ProductCard({ product, isOwner, onEdit, onDelete }) {
  const photos = product.photos || [];
  const mainIndex = product.mainPhotoIndex ?? 0;

  const orderedPhotos = [
    ...photos.slice(mainIndex),
    ...photos.slice(0, mainIndex)
  ];

  const [activePhoto, setActivePhoto] = useState(0);

  useEffect(() => {
    setActivePhoto(0);
  }, [product._id, product.mainPhotoIndex]);

  const previousPhoto = () => {
    setActivePhoto((current) =>
      (current - 1 + orderedPhotos.length) % orderedPhotos.length
    );
  };

  const nextPhoto = () => {
    setActivePhoto((current) =>
      (current + 1) % orderedPhotos.length
    );
  };

  return (
    <div className="product-card">

      <div className="product-image-container">

        {orderedPhotos.length > 0 && (
          <img
            src={orderedPhotos[activePhoto]}
            alt={product.name}
          />
        )}

        {orderedPhotos.length > 1 && (
          <>
            <button
              type="button"
              className="image-arrow previous-arrow"
              onClick={previousPhoto}
              aria-label="Previous photo"
            >
              &#10094;
            </button>

            <button
              type="button"
              className="image-arrow next-arrow"
              onClick={nextPhoto}
              aria-label="Next photo"
            >
              &#10095;
            </button>

            <span className="photo-counter">
              {activePhoto + 1}/{orderedPhotos.length}
            </span>
          </>
        )}

      </div>

      <h3>{product.name}</h3>

      <p>Cloth Code: {product.clothCode}</p>

      {product.offerPrice ? (
        <p className="product-price">
          <del>₹{product.price}</del>
          <strong>₹{product.offerPrice}</strong>
        </p>
      ) : (
        <p className="product-price">
          ₹{product.price}
        </p>
      )}

      <p>Sizes: {(product.sizes || []).join(', ')}</p>

      <p>Fabric: {product.fabric}</p>

      {isOwner && (
        <div className="product-actions">

          <button
            type="button"
            className="edit-button"
            onClick={() => onEdit(product)}
          >
            Edit Product
          </button>

          <button
            type="button"
            className="delete-button"
            onClick={() => onDelete(product._id)}
          >
            Delete Product
          </button>

        </div>
      )}

    </div>
  );
}

// MAIN APP
function App() {
  const [products, setProducts] = useState([]);

  const [password, setPassword] = useState('');

  const [token, setToken] = useState(
    localStorage.getItem('ownerToken') || ''
  );

  const [showLogin, setShowLogin] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const [editingProduct, setEditingProduct] = useState(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState(emptyForm);

  const [photos, setPhotos] = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const [mainPhotoIndex, setMainPhotoIndex] = useState(0);

  // PHOTO PREVIEWS
  useEffect(() => {
    const previews = photos.map((photo) =>
      URL.createObjectURL(photo)
    );

    setPhotoPreviews(previews);

    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [photos]);

  // LOAD PRODUCTS
  const loadProducts = async () => {
    try {
      setLoading(true);

      const data = await getProducts();

      setProducts(data);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // OWNER LOGIN
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const data = await ownerLogin(password);

      localStorage.setItem('ownerToken', data.token);

      setToken(data.token);
      setPassword('');
      setShowLogin(false);
      setError('');
      setSuccess('');

    } catch (err) {
      setError(err.message);
    }
  };

  // OWNER LOGOUT
  const handleLogout = () => {
    localStorage.removeItem('ownerToken');

    setToken('');
    setShowLogin(false);
    setShowAddForm(false);
    setEditingProduct(null);

    // Clear owner messages from customer view
    setSuccess('');
    setError('');

    setPassword('');
    resetForm();
  };

  // FORM INPUT
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  // SIZE SELECTION
  const handleSizeChange = (size) => {
    setForm((previous) => ({
      ...previous,
      sizes: previous.sizes.includes(size)
        ? previous.sizes.filter((item) => item !== size)
        : [...previous.sizes, size]
    }));
  };

  // PHOTO SELECTION
  const handlePhotoChange = (e) => {
    const selectedPhotos = Array.from(e.target.files || []);

    setPhotos(selectedPhotos);
    setMainPhotoIndex(0);
    setError('');
  };

  // RESET FORM
  const resetForm = () => {
    setForm({ ...emptyForm });
    setPhotos([]);
    setMainPhotoIndex(0);

    const fileInput = document.getElementById('productPhotos');

    if (fileInput) {
      fileInput.value = '';
    }
  };

  // OPEN ADD FORM
  const openAddForm = () => {
    resetForm();

    setEditingProduct(null);
    setShowAddForm(true);

    setError('');
    setSuccess('');
  };

  // OPEN EDIT FORM
  const handleEditProduct = (product) => {
    setEditingProduct(product);

    setForm({
      name: product.name || '',
      clothCode: product.clothCode || '',
      price: product.price ?? '',
      offerPrice: product.offerPrice ?? '',
      sizes: product.sizes || [],
      fabric: product.fabric || ''
    });

    setPhotos([]);
    setMainPhotoIndex(product.mainPhotoIndex ?? 0);

    setShowAddForm(true);

    setError('');
    setSuccess('');

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // CLOSE FORM
  const closeForm = () => {
    setShowAddForm(false);
    setEditingProduct(null);

    resetForm();

    setError('');
  };

  // ADD OR UPDATE PRODUCT
  const handleSaveProduct = async (e) => {
    e.preventDefault();

    setError('');
    setSuccess('');

    if (form.sizes.length === 0) {
      setError('Please select at least one size.');
      return;
    }

    if (!editingProduct && (photos.length < 2 || photos.length > 4)) {
      setError('Please select 2 to 4 product photos.');
      return;
    }

    if (
      editingProduct &&
      photos.length > 0 &&
      (photos.length < 2 || photos.length > 4)
    ) {
      setError('Please select 2 to 4 product photos.');
      return;
    }

    if (
      form.offerPrice &&
      Number(form.offerPrice) >= Number(form.price)
    ) {
      setError('Offer price must be less than the original price.');
      return;
    }

    try {
      setSubmitting(true);

      const formData = new FormData();

      formData.append('name', form.name);
      formData.append('clothCode', form.clothCode);
      formData.append('price', form.price);
      formData.append('offerPrice', form.offerPrice);
      formData.append('fabric', form.fabric);
      formData.append('mainPhotoIndex', mainPhotoIndex);

      form.sizes.forEach((size) => {
        formData.append('sizes', size);
      });

      photos.forEach((photo) => {
        formData.append('photos', photo);
      });

      if (editingProduct) {
        const result = await updateProduct(
          editingProduct._id,
          formData,
          token
        );

        const updatedProduct = result.product || result;

        setProducts((previous) =>
          previous.map((product) =>
            product._id === editingProduct._id
              ? updatedProduct
              : product
          )
        );

        setSuccess('Product updated successfully!');

      } else {
        const result = await addProduct(formData, token);

        const newProduct = result.product || result;

        setProducts((previous) => [
          newProduct,
          ...previous
        ]);

        setSuccess('Product added successfully!');
      }

      setShowAddForm(false);
      setEditingProduct(null);

      resetForm();

    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // DELETE PRODUCT
  const handleDeleteProduct = async (productId) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this product?'
    );

    if (!confirmed) return;

    try {
      await deleteProduct(productId, token);

      setProducts((previous) =>
        previous.filter((product) => product._id !== productId)
      );

      setSuccess('Product deleted successfully!');
      setError('');

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="app">

      {/* HEADER */}
      <header className="header">
        <h1>MAGUVA MANDIR PRODUCT CATALOGUE</h1>
      </header>

      <main>

        {/* OWNER CONTROLS */}
        <div className="owner-controls">

          {token ? (
            <>
              <button onClick={openAddForm}>
                Add Product
              </button>

              <button onClick={handleLogout}>
                Owner Logout
              </button>
            </>
          ) : (
            <button onClick={() => setShowLogin(!showLogin)}>
              Owner Login
            </button>
          )}

        </div>

        {/* OWNER LOGIN */}
        {showLogin && !token && (
          <form className="login-form" onSubmit={handleLogin}>

            <input
              type="password"
              placeholder="Enter owner password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button type="submit">
              Login
            </button>

          </form>
        )}

        {/* ADD / EDIT PRODUCT FORM */}
        {showAddForm && token && (
          <form
            className="product-form"
            onSubmit={handleSaveProduct}
          >

            <h3>
              {editingProduct ? 'Edit Product' : 'Add Product'}
            </h3>

            <label>Product Name</label>

            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleInputChange}
              required
            />

            <label>Cloth Code</label>

            <input
              type="text"
              name="clothCode"
              value={form.clothCode}
              onChange={handleInputChange}
              required
            />

            <label>Price (₹)</label>

            <input
              type="number"
              name="price"
              value={form.price}
              onChange={handleInputChange}
              min="1"
              required
            />

            <label>Offer Price (₹) - Optional</label>

            <input
              type="number"
              name="offerPrice"
              value={form.offerPrice}
              onChange={handleInputChange}
              min="1"
            />

            <label>Available Sizes</label>

            <div className="size-options">

              {availableSizes.map((size) => (
                <label key={size}>

                  <input
                    type="checkbox"
                    checked={form.sizes.includes(size)}
                    onChange={() => handleSizeChange(size)}
                  />

                  {size}

                </label>
              ))}

            </div>

            <label>Fabric</label>

            <input
              type="text"
              name="fabric"
              value={form.fabric}
              onChange={handleInputChange}
              required
            />

            <label>
              {editingProduct
                ? 'Replace Photos (Optional: 2 to 4 photos)'
                : 'Product Photos (2 to 4)'}
            </label>

            <input
              id="productPhotos"
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoChange}
              required={!editingProduct}
            />

            {editingProduct && photos.length === 0 && (
              <p className="photo-count">
                Existing photos will be kept if you do not select new ones.
              </p>
            )}

            {/* PHOTO PREVIEW */}
            {(photos.length > 0 ||
              (editingProduct && editingProduct.photos?.length > 0)) && (
              <div className="photo-preview-section">

                <p className="preview-heading">
                  Select Main Photo
                </p>

                <div className="photo-preview-grid">

                  {(photos.length > 0
                    ? photoPreviews
                    : editingProduct.photos
                  ).map((preview, index) => (

                    <div
                      className={`photo-preview ${
                        mainPhotoIndex === index
                          ? 'selected-main-photo'
                          : ''
                      }`}
                      key={index}
                    >

                      <img
                        src={preview}
                        alt={`Product photo ${index + 1}`}
                      />

                      <label>

                        <input
                          type="radio"
                          name="mainPhoto"
                          checked={mainPhotoIndex === index}
                          onChange={() => setMainPhotoIndex(index)}
                        />

                        {mainPhotoIndex === index
                          ? 'Main Photo'
                          : 'Select as Main'}

                      </label>

                    </div>

                  ))}

                </div>

              </div>
            )}

            <button type="submit" disabled={submitting}>
              {submitting
                ? 'Please wait...'
                : editingProduct
                  ? 'Update Product'
                  : 'Save Product'}
            </button>

            <button
              type="button"
              className="cancel-button"
              onClick={closeForm}
            >
              Cancel
            </button>

          </form>
        )}

        {/* STATUS MESSAGES */}
        {error && (
          <p className="error-message">
            {error}
          </p>
        )}

        {success && token && (
          <p className="success-message">
            {success}
          </p>
        )}

        {/* PRODUCT CATALOGUE */}
        {loading ? (
          <p className="status-message">
            Loading products...
          </p>
        ) : products.length === 0 ? (
          <p className="status-message">
            No products available.
          </p>
        ) : (
          <div className="product-grid">

            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                isOwner={!!token}
                onEdit={handleEditProduct}
                onDelete={handleDeleteProduct}
              />
            ))}

          </div>
        )}

      </main>
    </div>
  );
}

export default App;
