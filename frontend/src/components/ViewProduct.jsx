import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../axios';
import { 
  FaTag, 
  FaMoneyBillWave, 
  FaClipboardList, 
  FaBoxOpen,
  FaUser
} from 'react-icons/fa';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation } from 'swiper/modules';

const ViewProduct = () => {
  const [product, setProduct] = useState(null);
  const [userOrderHistory, setUserOrderHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { productId } = useParams();
  const navigate = useNavigate()

  useEffect(() => {
    const fetchProductDetails = async () => {
        try {
            const user = await axios.get('/users/current-user')
            // console.log(user);
        } catch (err) {
            console.error('Error fetching current user details:', err);
            navigate('/login');
        }
      try {
        setLoading(true);
        const response = await axios.get(`/products/get-product/${productId}`);
        setProduct(response.data.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching product details:', err);
        setError(err.response?.data?.message || 'Failed to fetch product');
        setLoading(false);
      }
    };

    if (productId) {
      fetchProductDetails();
    }
  }, [productId]);


  useEffect(() => {
    const fetchUserOrderHistory = async () => {
        try {
            const ordersResponse = await axios.get('/users/user-order-history')
            // setUserOrderHistory(ordersResponse.data.data);
            console.log(ordersResponse.data.data.orderHistory);
            setUserOrderHistory(ordersResponse.data.data.orderHistory);
        } catch (err) {
            console.error('Error fetching user-order-history details:', err);
        }
    };
    fetchUserOrderHistory();
  },[]);

  const isProductInOrderHistory = () => {
    return userOrderHistory.some(order => 
      order.product === product._id && order.orderStatus === "Pending"
    );
  };


  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-light-blue"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen text-red-500">
        {error}
      </div>
    );
  }

  if (!product) {
    return null;
  }

  const onBuyProduct = async () => {
    try {

        const userResponse = await axios.get('/users/current-user');
        const user = userResponse.data.data;

        if(user._id === product.owner._id){
            return alert('Both Buyer and Seller are Same!');
        }
        const response = await axios.post('/orders/place-order', {
            buyer: user._id,
            seller: product.owner._id,
            product: product._id,
            quantity: product.quantity,
            price: product.price,
        });
        // alert('Order placed successfully');
        console.log(response.data);
    } catch (err) {
        console.error('Error buying product:', err);
        // setError(err.response?.data?.message || 'Failed to buy product');
    }
  }

  const onCancelOrder = async () => {
    try {
        const orderToCancel = userOrderHistory.find(order => 
            order.product === product._id && order.orderStatus === "Pending"
        );

        if (!orderToCancel) {
            alert('No order found for this product');
            return;
        }

        const response = await axios.post('/orders/cancel-order', {
            orderId: orderToCancel._id,
            productId: orderToCancel.product
        });

        // alert('Order cancelled successfully');

        const ordersResponse = await axios.get('/users/user-order-history');
        setUserOrderHistory(ordersResponse.data.data.orderHistory);
        setProduct(prevProduct => ({
            ...prevProduct,
            productStatus: 'Available'
        }));
    } catch (err) {
        console.error('Error cancelling order:', err);
        alert('Failed to cancel order');
    }
  }


  return (
    <div className="min-h-screen bg-gradient-primary py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto bg-dark-primary/90 rounded-xl shadow-2xl p-8 grid md:grid-cols-2 gap-8">
        {/* Image Gallery */}
        <div>
          <Swiper
            navigation={true}
            modules={[Navigation]}
            className="product-swiper rounded-xl"
          >
            {product.productImages.map((image, index) => (
              <SwiperSlide key={index}>
                <img 
                  src={image} 
                  alt={`Product ${index + 1}`} 
                  className="w-full h-96 object-cover rounded-xl"
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-light-blue mb-4">
            {product.name}
          </h1>

          <div className="flex items-center space-x-4 mb-4">
            <div className="flex items-center space-x-2">
              <FaMoneyBillWave className="text-light-blue" />
              <span className="text-xl font-semibold text-white">
                ₹{product.price}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <FaBoxOpen className="text-light-blue" />
              <span className="text-white">
                Quantity: {product.quantity}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <FaClipboardList className="text-light-blue mt-1" />
              <div>
                <h3 className="font-semibold text-white">Description</h3>
                <p className="text-gray-300">{product.description}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <FaTag className="text-light-blue" />
              <div>
                <h3 className="font-semibold text-white">Category</h3>
                <p className="text-gray-300">{product.category.name}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <FaUser className="text-light-blue" />
              <div>
                <h3 className="font-semibold text-white">Seller</h3>
                <p className="text-gray-300">{product.owner.name}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex space-x-4">
            <button
              className="
                w-full py-3 
                bg-blue-300 text-dark-primary 
                rounded-lg font-semibold
                hover:border hover:border-light-blue hover:bg-blue-950 hover:text-light-blue
                transition-all
              "
            >
              Contact Seller
            </button>
            {isProductInOrderHistory() ? (
            <button 
              onClick={onCancelOrder}
              className="
                w-full py-3 
                bg-red-500 text-white 
                rounded-lg font-semibold
                hover:bg-red-600
                transition-all
              "
            >
              Cancel Order
            </button>
          ) : (
            <button 
              onClick={onBuyProduct}
              className="
                w-full py-3 
                bg-blue-300 text-dark-primary 
                rounded-lg font-semibold
                hover:border hover:border-light-blue hover:bg-blue-950 hover:text-light-blue
                transition-all
              "
            >
              Buy Product
            </button>
          )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewProduct;







//   const onBuyProduct = async () => {
//     const user = {};
//     try {
//         user = await axios.get('/users/current-user')
//     } catch (err) {
//         navigate('/login');
//     }
//     if(user._id === product.owner._id){
//         return alert('Both Buyer and Seller are Same!');
//     }
//     try {
//         const response = await axios.post('/orders/place-order', {
//             buyer: user._id,
//             seller: product.owner._id,
//             product: productId,
//             quantity: product.quantity,
//             price: product.price,
//         });
//         console.log(response.data);
//     } catch (err) {
//         console.error('Error buying product:', err);
//         // setError(err.response?.data?.message || 'Failed to buy product');
//     }
//   }