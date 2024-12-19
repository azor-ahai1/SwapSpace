import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../axios';
import { 
  FaPlus, 
  FaTrash, 
  FaCloudUploadAlt 
} from 'react-icons/fa';

const EditProduct = () => {
  const { productId } = useParams();
  const navigate = useNavigate();

  // State for form data
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [quantity, setQuantity] = useState('');
  
  // State for image handling
  const [productImages, setProductImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [previewNewImages, setPreviewNewImages] = useState([]);

  // Categories state
  const [categories, setCategories] = useState([]);

  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch product details and categories on component mount
  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        // Fetch product details
        const productResponse = await axios.get(`/products/get-product/${productId}`);
        const product = productResponse.data.data;

        // Set form data
        setName(product.name);
        setPrice(product.price);
        setDescription(product.description);
        setCategory(product.category.name);
        setQuantity(product.quantity);
        setProductImages(product.productImages);

        // Fetch categories
        const categoriesResponse = await axios.get('/categories/getallcategories');
        setCategories(categoriesResponse.data.data);
      } catch (err) {
        setError('Failed to fetch product details');
        console.error(err);
      }
    };

    fetchProductDetails();
  }, [productId]);

  // Handle new image upload
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    // Create preview URLs for new images
    const newImagePreviews = files.map(file => URL.createObjectURL(file));
    
    // Update state
    setNewImages(prev => [...prev, ...files]);
    setPreviewNewImages(prev => [...prev, ...newImagePreviews]);
  };

  // Remove existing image
  const removeExistingImage = (imageToRemove) => {
    setProductImages(prev => 
      prev.filter(image => image !== imageToRemove)
    );
  };

  // Remove new image
  const removeNewImage = (indexToRemove) => {
    setNewImages(prev => prev.filter((_, index) => index !== indexToRemove));
    setPreviewNewImages(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Create FormData
      const formData = new FormData();

      // Add text fields
      formData.append('name', name);
      formData.append('price', price);
      formData.append('description', description);
      formData.append('category', category);
      formData.append('quantity', quantity);

      // Send existing images as JSON string
      formData.append('productImages', JSON.stringify(productImages));

      // Add new images
      newImages.forEach((file) => {
        formData.append('images', file);
      });

      // Submit update
      const response = await axios.patch(
        `/products/update-product/${productId}`, 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      // Navigate back or show success
      navigate(`/products/${productId}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update product');
      setLoading(false);
    }
  };

  // Render method
  return (
    <div className="min-h-screen bg-gradient-primary py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-dark-primary/90 rounded-xl p-8">
        <h2 className="text-3xl font-bold text-light-blue mb-8">Edit Product</h2>
        
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-300 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Product Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 bg-dark-primary border border-slate-gray rounded-lg text-white"
            />
          </div>

          {/* Price and Quantity Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Price
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                className="w-full px-4 py-3 bg-dark-primary border border-slate-gray rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Quantity
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
                className="w-full px-4 py-3 bg-dark-primary border border-slate-gray rounded-lg text-white"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              className="w-full px-4 py-3 bg-dark-primary border border-slate-gray rounded-lg text-white"
            >
              {categories.map((cat) => (
                <option key={cat.name} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
              className="w-full px-4 py-3 bg-dark-primary border border-slate-gray rounded-lg text-white"
            />
          </div>

          {/* Image Upload Section */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Product Images
            </label>
            
            {/* Existing Images */}
            <div className="grid grid-cols-4 gap-4 mb-4">
              {productImages.map((image, index) => (
                <div key={index} className="relative">
                   <img src={image} alt={`Product Image ${index + 1}`} className="w-full h-32 object-cover rounded-lg" />
                    <button 
                      type="button" 
                      onClick={() => removeExistingImage(image)} 
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                    >
                      <FaTrash />
                    </button>
                </div>
              ))}
            </div>

            {/* New Image Upload */}
            <input 
              type="file" 
              accept="image/*" 
              multiple 
              onChange={handleImageUpload} 
              className="mb-4"
            />
            <div className="grid grid-cols-4 gap-4">
              {previewNewImages.map((image, index) => (
                <div key={index} className="relative">
                  <img src={image} alt={`New Image Preview ${index + 1}`} className="w-full h-32 object-cover rounded-lg" />
                  <button 
                    type="button" 
                    onClick={() => removeNewImage(index)} 
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            className={`w-full py-3 bg-blue-600 text-white rounded-lg ${loading ? 'opacity-50 cursor-not-allowed' : ''}`} 
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Product'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProduct;