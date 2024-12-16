import { Order } from "../models/order.model.js";
import { Product } from "../models/product.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

const placeOrder = asyncHandler(async (req, res) => {
    const { buyer, seller, product, quantity, price } = req.body;
    const order = await Order.create({
        price,
        quantity,
        buyer,
        seller,
        product,
        orderDate: new Date(),
    })

    const createdOrder = await Order.findById(order._id)
    .populate('product', 'name')
    .populate('buyer', 'name email')
    .populate('seller', 'name email');

    const updatedproduct = await Product.findByIdAndUpdate(
        product,
        {productStatus:"Ordered"},
        { new: true }
    )
    
    if (!createdOrder){
        throw new ApiError(404, "Something went wrong while placing order.");
    }

    if (!updatedproduct){
        throw new ApiError(404, "Something went wrong while placing order.");
    }

    return res.status(201).json(
        new ApiResponse(200, createdOrder, "Order Placed Successfully")
    )
    
});



const cancelOrder = asyncHandler(async (req, res) => {
    const { orderId, productId } = req.body;
    console.log('Cancel Order Inputs:', { orderId, productId });
    const cancelledOrder = await Order.findByIdAndUpdate(
        orderId,
        {orderStatus: "Cancelled"},
        { new: true }
    )

    const updatedproduct = await Product.findByIdAndUpdate(
        productId,
        {productStatus:"Available"},
        { new: true }
    )
    
    if (!cancelledOrder){
        console.error('Order not found or update failed');
        throw new ApiError(404, "Something went wrong while cancelling order.");
    }
    if (!updatedproduct){
        console.error('Product update failed');
        throw new ApiError(404, "Something went wrong while cancelling order.");
    }
    
    return res.status(200).json(
        new ApiResponse(200, cancelledOrder, "Order Cancelled Successfully")
    )
    
});



export { placeOrder, cancelOrder}