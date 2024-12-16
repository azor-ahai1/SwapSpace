import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  FaUser, 
  FaEnvelope, 
  FaBox, 
  FaShoppingCart, 
  FaEdit,
  FaPhone 
} from 'react-icons/fa';
import axios from '../axios';
import { selectUser } from '../store/authSlice';

const UserProfile = () => {
    const { userId } = useParams();
    const loggedInUser = useSelector(selectUser);
    const [userProfile, setUserProfile] = useState(null);
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(true);

  const isCurrentUser = loggedInUser?._id === userId;

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        // Fetch user profile using the new endpoint
        const profileResponse = await axios.get(`/users/profile/${userId}`);
        setUserProfile(profileResponse.data.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
        // Handle error (e.g., show error message, redirect)
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  const renderProfileContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="bg-dark-primary/80 p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-light-blue mb-4">Profile Details</h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <FaUser className="mr-3 text-light-blue" />
                <span className="text-white">{userProfile.name}</span>
              </div>
              <div className="flex items-center">
                <FaEnvelope className="mr-3 text-light-blue" />
                <span className="text-white">{userProfile.email}</span>
              </div>
              {userProfile.phoneNumber && (
                <div className="flex items-center">
                  <FaPhone className="mr-3 text-light-blue" />
                  <span className="text-white">{userProfile.phoneNumber}</span>
                </div>
              )}
            </div>
          </div>
        );

      case 'orders':
        return (
          <div className="bg-dark-primary/80 p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-light-blue mb-4">Order History</h2>
            {userProfile.orderHistory.length === 0 ? (
              <p className="text-gray-400">No orders found</p>
            ) : (
              <div className="space-y-4">
                {userProfile.orderHistory.map((order) => (
                  <div 
                    key={order._id} 
                    className="bg-dark-primary border border-slate-gray rounded-lg p-4"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-white font-semibold">
                          Order for {order.productDetails?.name || 'Product'}
                        </p>
                        <p className="text-gray-400">
                          Status: {order.orderStatus}
                        </p>
                      </div>
                      <span className="text-light-blue font-bold">
                        ₹{order.price}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'products':
        return (
          <div className="bg-dark-primary/80 p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-light-blue mb-4">My Products</h2>
            {userProfile.productHistory.length === 0 ? (
              <p className="text-gray-400">No products listed</p>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {userProfile.productHistory.map((product) => (
                  <div 
                    key={product._id} 
                    className="bg-dark-primary border border-slate-gray rounded-lg p-4"
                  >
                    <img 
                      src={product.productImages[0]} 
                      alt={product.name} 
                      className="w-full h-40 object-cover rounded-lg mb-4"
                    />
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-white font-semibold">{product.name}</p>
                        <p className="text-gray-400">
                          Status: {product.productStatus}
                        </p>
                      </div>
                      <span className="text-light-blue font-bold">
                        ₹{product.price}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-light-blue"></div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center">
        <p className="text-white text-2xl">User not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-primary py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* User Header */}
        <div className="bg-dark-primary/90 rounded-t-xl p-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-light-blue text-dark-primary rounded-full w-16 h-16 flex items-center justify-center">
              <FaUser size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-light-blue">
                {userProfile.name}
              </h1>
              <p className="text-gray-400">{userProfile.email}</p>
            </div>
          </div>
          {isCurrentUser && (
            <Link 
              to="/edit-profile"
              className="bg-light-blue text-dark-primary px-4 py-2 rounded-lg hover:bg-opacity-90 flex items-center"
            >
              <FaEdit className="mr-2" /> Edit Profile
            </Link>
          )}
        </div>

        {/* Tabs */}
        {isCurrentUser && (
          <div className="bg-dark-primary/80 border-b border-slate-gray flex">
            <button
              onClick={() => setActiveTab('profile')}
              className={`
                px-6 py-3 
                ${activeTab === 'profile' 
                  ? 'bg-light-blue text-dark-primary' 
                  : 'text-gray-400 hover:bg-dark-primary/50'}
              `}
            >
              Profile
            </button>
            <button
              onClick={() => setActiveTab('orders')}
               className={`
                px-6 py-3 
                ${activeTab === 'orders' 
                  ? 'bg-light-blue text-dark-primary' 
                  : 'text-gray-400 hover:bg-dark-primary/50'}
              `}
            >
              Order History
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`
                px-6 py-3 
                ${activeTab === 'products' 
                  ? 'bg-light-blue text-dark-primary' 
                  : 'text-gray-400 hover:bg-dark-primary/50'}
              `}
            >
              My Products
            </button>
          </div>
        )}

        {/* Profile Content */}
        <div className="mt-6">
          {renderProfileContent()}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;