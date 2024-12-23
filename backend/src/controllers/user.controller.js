import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { User } from "../models/user.model.js";
import { uploadProfileImageOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const generateAccessAndRefreshTokens = async(userId) => {
    try{
        const user = await User.findById(userId);
        if(!user) {
            throw new ApiError('User not found while generating tokens', 404);
        }
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        
        user.refreshToken = refreshToken
        await user.save({validateBeforeSave : false})

        return {accessToken, refreshToken}
    }
    catch(error){
        throw new ApiError(500, "Something went wrong while generating Tokens during Login");
    }
}


const registerUser = asyncHandler(async (req, res) => {
    const {name, email, password} = req.body
    console.log("email: ", email);

    if([name, email, password].some(
        (field) => field?.trim() === "" )
    ){
        throw new ApiError(400, "All fields are required");
    }

    const existedUser = await User.findOne({email})

    // const existedUser = await User.findOne({
    //     $or: [{username}, {email}]
    // })

    if (existedUser) {
        throw new ApiError(409, "User with E-mail already exists");
    }

    // const avatarLocalPath = req.files?.avatar[0]?.path;
    // // const coverImageLocalPath = req.files?.coverImage[0]?.path;
    // // it was sending undefined when there was no coverimage

    // let coverImageLocalPath;
    // if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
    //     coverImageLocalPath = req.files.coverImage[0].path;
    // }

    // if(!avatarLocalPath){
    //     throw new ApiError(400, "Avatar is required");
    // }
    
    // const avatar = await uploadOnCloudinary(avatarLocalPath)
    // const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    
    // if(!avatar){
    //     throw new ApiError(400, "Avatar is required");
    // }

    const user = await User.create({
        name, 
        email, 
        password
    })

    const createdUser = await User.findById(user._id).select(
        "-passowrd -refreshToken"
    )

    if (!createdUser){
        throw new ApiError(404, "Something went wrong while registering the user.");
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User Registered Successfully")
    )

    // if(fullName==""){
    //     throw new ApiError(400, "Full name is required");
    // }


    // res.status(200).json({
    //  message: "User registered successfully",
    // })
}) 

const loginUser = asyncHandler(async (req, res) => {
    // req body -> data
    // username or email
    // find the user
    // password check
    // access and refresh tokens
    // send cookies

    const { email, password  } = req.body;

    if(!email){
        throw new ApiError(400, "Username or Email is required");
    }

    if(!password){
        throw new ApiError(400, "Password is required");
    }
    console.log(email);
    const user = await User.findOne({email: email.toLowerCase()})

    if(!user){
        throw new ApiError(404, "User not found");
    }

    const isPasswordValid = await user.isPasswordCorrect(password)
    
    if(!isPasswordValid){
        throw new ApiError(401, "Invalid Password");
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id);
    
    if(!accessToken){
        throw new ApiError(500, "Failed to generate access token");
    }
    if(!refreshToken){
        throw new ApiError(500, "Failed to generate refresh token");
    }

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        // expires: new Date(Date.now() + 30 * 24 * 60 * 60
        httpOnly: true,
        secure: true,
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged in successfully",
        )
    )



})

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                // refreshToken: undefined
                refreshToken: 1   // it removes the field from the document
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true,
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"))

})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError('No refresh token provided', 401);
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id)
    
        if(!user){
            throw new ApiError('User not found while refreshing token', 404);
        }
        
        if(incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError('Refresh token is expired', 401);
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken, newrefreshToken} = await generateAccessAndRefreshTokens(user._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newrefreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    accessToken,
                    refreshToken: newrefreshToken
                },
                "Refresh token generated successfully",
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }
})

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const {oldPassword, newPassword} = req.body

    const user = User.findById(req.user?._id)
    const isPasswordCorrect = user.isPasswordCorrect(oldPassword)
    
    if(!isPasswordCorrect) {
        throw new ApiError(400, "Invalid Old Password")
    }

    user.password = newPassword
    await user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(new ApiResponse(
        200,
        {},
        "Password changed successfully"
    ))
})

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
    .status(200)
    .json(new ApiResponse(
        200,
        req.user,
        "Current User retrieved successfully"
    ))
})

const updateAccountDetails = asyncHandler(async (req, res) => {
    
    const {name, email, phoneNumber, instaID} = req.body

    if(!name || !email){
        throw new ApiError(400, "Name and Email are required")
    }

    const profileImageLocalPath = req.file?.path;
    // console.log("profileImageLocalPath: ",profileImageLocalPath);
    let profileImageURL="";
    if(profileImageLocalPath){
        const profileImage = await uploadProfileImageOnCloudinary(profileImageLocalPath);
        if(!profileImage){
            throw new ApiError(400, "Avatar Upload Failed")
        }
        else{
            profileImageURL = profileImage.url
        }
    }
    
    const updatedUser = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                name: name.trim(),
                email: email.trim().toLowerCase(),
                phoneNumber: phoneNumber,
                instaID: instaID,
                profileImage: profileImageURL,
            }
        },
        {
            new: true,
            runValidators: true 
        }
    ).select("-password -refreshToken")
    
    return res
    .status(200)
    .json(new ApiResponse(
        200,
        updatedUser.toObject(),  // toObject is neccessary otherwise getting the  TypeError: Converting circular structure to JSON 
        "Account details updated successfully"
    ))
})


const getUserOrderHistory = asyncHandler(async (req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "orders",
                localField: "_id",
                foreignField: "buyer",
                as: "orderHistory"
            }
        },
        {
            $addFields: {
                // Use $size on the actual array
                totalBuyerOrders: { $size: "$orderHistory" }
            }
        },
        {
            $lookup: {
                from: "orders",
                localField: "_id",
                foreignField: "seller",
                as: "sellerOrders"
            }
        },
        {
            $addFields: {
                // Use $size on the seller orders array
                totalSellerOrders: { $size: "$sellerOrders" }
            }
        },
        {
            $project: {
                orderHistory: 1,
                sellerOrders: 1,
                totalBuyerOrders: 1,
                totalSellerOrders: 1
            }
        }
    ]);

    return res.status(200).json(
        new ApiResponse(
            200,
            user[0] || { buyerOrders: [], sellerOrders: [], totalBuyerOrders: 0, totalSellerOrders: 0 },
            "User order history retrieved successfully"
        )
    );
});


const getUserProductHistory = asyncHandler(async (req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "products",
                localField: "_id",
                foreignField: "owner",
                as: "productHistory"
            }
        },
        {
            $addFields: {
                // Use $size on the actual array
                totalProducts: { $size: "$productHistory" }
            }
        },
        {
            $project: {
                productHistory: 1,
                totalProducts: 1,
            }
        }
    ]);

    return res.status(200).json(
        new ApiResponse(
            200,
            user[0] || { productHistory: [], totalproducts: 0 },
            "User products history retrieved successfully"
        )
    );
});


const getUserDashboardData = asyncHandler(async (req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "products",
                localField: "_id",
                foreignField: "owner",
                as: "products"
            }
        },
        {
            $lookup: {
                from: "orders",
                let: { userId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $or: [
                                    { $eq: ["$buyer", "$$userId"] },
                                    { $eq: ["$seller", "$$userId"] }
                                ]
                            }
                        }
                    }
                ],
                as: "orders"
            }
        },
        {
            $addFields: {
                totalProducts: { $size: "$products" },
                availableProducts: {
                    $size: {
                        $filter: {
                            input: "$products",
                            as: "product",
                            cond: { $eq: ["$$product.productStatus", "Available"] }
                        }
                    }
                },
                totalBuyerOrders: {
                    $size: {
                        $filter: {
                            input: "$orders",
                            as: "order",
                            cond: { $eq: ["$$order.buyer", "$_id"] }
                        }
                    }
                },
                totalSellerOrders: {
                    $size: {
                        $filter: {
                            input: "$orders",
                            as: "order",
                            cond: { $eq: ["$$order.seller", "$_id"] }
                        }
                    }
                },
                totalRevenue: {
                    $sum: {
                        $cond: {
                            if: { $eq: ["$orders.orderStatus", "Accepted"] },
                            then: "$orders.orderPrice",  // Ensure this field exists
                            else: 0
                        }
                    }
                }
            }
        },
        {
            $project: {
                products: 1,
                orders: 1,
                totalProducts: 1,
                availableProducts: 1,
                totalBuyerOrders: 1,
                totalSellerOrders: 1,
                totalRevenue: 1
            }
        }
    ]);

    return res.status(200).json(
        new ApiResponse(
            200,
            user[0] || {
                totalProducts: 0,
                availableProducts: 0,
                totalBuyerOrders: 0,
                totalSellerOrders: 0,
                totalRevenue: 0
            },
            "User dashboard data retrieved successfully"
        )
    );
});


const getUserProfile = asyncHandler(async (req, res) => {
    const userId = req.params.userId;

    const userProfile = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup: {
                from: "products",
                localField: "_id",
                foreignField: "owner",
                as: "productHistory"
            }
        },
        {
            $lookup: {
                from: "orders",
                let: { userId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $or: [
                                    { $eq: ["$buyer", "$$userId"] },
                                    { $eq: ["$seller", "$$userId"] }
                                ]
                            }
                        }
                    },
                    {
                        $lookup: {
                            from: "products",
                            localField: "product",
                            foreignField: "_id",
                            as: "productDetails"
                        }
                    },
                    {
                        $unwind: "$productDetails"
                    }
                ],
                as: "orderHistory"
            }
        },
        {
            $addFields: {
                totalProducts: { $size: "$productHistory" },
                availableProducts: {
                    $size: {
                        $filter: {
                            input: "$productHistory",
                            as: "product",
                            cond: { $eq: ["$$product.productStatus", "Available"] }
                        }
                    }
                },
                totalBuyerOrders: {
                    $size: {
                        $filter: {
                            input: "$orderHistory",
                            as: "order",
                            cond: { $eq: ["$$order.buyer", "$_id"] }
                        }
                    }
                },
                totalSellerOrders: {
                    $size: {
                        $filter: {
                            input: "$orderHistory",
                            as: "order",
                            cond: { $eq: ["$$order.seller", "$_id"] }
                        }
                    }
                },
                totalRevenue: {
                    $sum: {
                        $cond: {
                            if: { $eq: ["$orderHistory.orderStatus", "Accepted"] },
                            then: "$orderHistory.price",
                            else: 0
                        }
                    }
                }
            }
        },
        {
            $project: {
                name: 1,
                email: 1,
                phoneNumber: 1,
                instaID: 1,
                productHistory: 1,
                orderHistory: 1,
                totalProducts: 1,
                availableProducts: 1,
                totalBuyerOrders: 1,
                totalSellerOrders: 1,
                totalRevenue: 1,
                createdAt: 1,
                profileImage: 1,
            }
        }
    ]);

    // Check if user exists
    if (!userProfile || userProfile.length === 0) {
        throw new ApiError(404, "User not found");
    }

    return res.status(200).json(
        new ApiResponse(
            200, 
            userProfile[0], 
            "User profile retrieved successfully"
        )
    );
});

export {
    registerUser, 
    loginUser, 
    logoutUser, 
    refreshAccessToken, 
    getCurrentUser, 
    changeCurrentPassword, 
    updateAccountDetails,
    getUserOrderHistory, 
    getUserProductHistory, 
    getUserProfile
}










