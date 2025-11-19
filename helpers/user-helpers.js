const db = require("../config/connection")
const collection = require('../config/collections')
const bcrypt = require('bcrypt')
const {ObjectId} = require('mongodb');
const Razorpay = require('razorpay');
const crypto = require('crypto')

const instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

module.exports = {
    dosignup: async function (userdata) {
        try {
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({email: userdata.email})
            let response = {}
            if (!user) {
                response.status = true
                userdata.password = await bcrypt.hash(userdata.password, 10)
                db.get().collection(collection.USER_COLLECTION).insertOne(userdata)
                response.user = userdata
                return response
            } else {
                console.log('user already exist')
                return {status: false}
            }

        } catch (err) {
            console.log(err)
        }

    },
    dologin: async function (userdata) {
        let response = {}
        try {
            const user = await db.get().collection(collection.USER_COLLECTION).findOne({email: userdata.email})
            if (user) {
                let status = await bcrypt.compare(userdata.password, user.password)
                if (status) {
                    response.user = user
                    response.status = true
                    return response
                } else {
                    return {status: false}
                }
            } else {
                console.log('login fail : ')
                return {status: false}
            }
        } catch (err) {
            console.log(err)
        }
    },


    addToCart: async function (productId, userId) {
        try {
            userId = new ObjectId(userId)
            productId = new ObjectId(productId)
            let productObj = {
                item: productId,
                quantity: 1
            }
            const userCart = await db.get().collection(collection.CART_COLLECTION).findOne({user: userId})

            if (userCart) {

                //Check product already exist
                let productExists = userCart.products.find(product => product.item.toString() === productId.toString())

                if (productExists) {
                    //Increment quantity
                    await db.get().collection(collection.CART_COLLECTION).updateOne(
                        {user: userId, 'products.item': productId},
                        {$inc: {'products.$.quantity': 1}}
                    )
                } else {
                    //Add new product
                    await db.get().collection(collection.CART_COLLECTION).updateOne(
                        {user: userId},
                        {$push: {products: productObj}}
                    )
                }
            } else {
                //New cart for user
                const cartObject = {
                    user: userId,
                    products: [productObj]
                }
                await db.get().collection(collection.CART_COLLECTION).insertOne(cartObject)

            }

        } catch (err) {
            console.log(err)
        }
    },

    getCartProducts: async function (userId) {
        try {
            userId = new ObjectId(userId)
            const cartItems = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: {user: userId}
                },
                {$unwind: '$products'},
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'products.item',
                        foreignField: '_id',
                        as: 'cartItems'
                    }
                },
                {$unwind: '$cartItems'},
                {
                    $project: {
                        item: '$cartItems._id',
                        name: '$cartItems.name',
                        price: '$cartItems.price',
                        description: '$cartItems.description',
                        quantity: '$products.quantity',
                        totalPrice: {
                            $multiply: [
                                {$toDouble: "$cartItems.price"},
                                {$toInt: "$products.quantity"}
                            ]
                        }
                    }
                }
            ]).toArray()
            return cartItems
        } catch (err) {
            console.log(err)
        }
    },

    getCartCount: async function (userId) {
        userId = new ObjectId(userId)
        try {
            let cartCount = await db.get().collection(collection.CART_COLLECTION).aggregate([

                {$match: {user: userId}},
                {$unwind: '$products'},
                {
                    $group: {
                        _id: '$user',
                        quantity: {$sum: '$products.quantity'},
                    }
                }
            ]).toArray()
            return cartCount[0].quantity
        } catch (err) {
            console.log(err)
        }
    },

    removeFromCart: async function (productId, userId) {
        try {
            userId = new ObjectId(userId)
            productId = new ObjectId(productId)
            await db.get().collection(collection.CART_COLLECTION).updateOne(
                {user: userId},
                {$pull: {products: {item: productId}}}
            )
        } catch (err) {
            console.log(err)
        }
    },

    incrementCartQuantity: async function (productId, userId) {
        try {
            productId = new ObjectId(productId)
            userId = new ObjectId(userId)

            const cartItems = await db.get().collection(collection.CART_COLLECTION)

            await cartItems.updateOne(
                {user: userId, 'products.item': productId},
                {$inc: {'products.$.quantity': 1}}
            )
            const result = await cartItems.aggregate([
                {$match: {user: userId}},
                {$unwind: '$products'},
                {$match: {'products.item': productId}},
                {$project: {quantity: '$products.quantity'}}
            ]).toArray()
            return result[0].quantity

        } catch (err) {
            console.log(err)
        }
    },

    decrementCartQuantity: async function (productId, userId) {
        try {
            productId = new ObjectId(productId)
            userId = new ObjectId(userId)

            const cartItems = await db.get().collection(collection.CART_COLLECTION)

            await cartItems.updateOne(
                {user: userId, 'products.item': productId},
                {$inc: {'products.$.quantity': -1}}
            )
            const result = await cartItems.aggregate([
                {$match: {user: userId}},
                {$unwind: '$products'},
                {$match: {'products.item': productId}},
                {$project: {quantity: '$products.quantity'}}
            ]).toArray()
            return result[0].quantity

        } catch (err) {
            console.log(err)
        }
    },

    getTotalAmount: async function (userId) {
        try {
            userId = new ObjectId(userId)
            const data = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {$match: {user: userId}},
                {$unwind: '$products'},
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'products.item',
                        foreignField: '_id',
                        as: 'cartItems'
                    }
                },
                {$unwind: '$cartItems'},
                {
                    $project: {
                        _id: '$user',
                        Quantity: {$toInt: '$products.quantity'},
                        Amount: {$multiply: [{$toInt: '$products.quantity'}, {$toInt: '$cartItems.price'}]},
                    }
                },
                {
                    $group: {
                        _id: '$_id',
                        totalQuantity: {$sum: '$Quantity'},
                        totalAmount: {$sum: '$Amount'},
                    }
                }
            ]).toArray()
            return data
        } catch (err) {
            console.log(err)
        }


    },
    placeOrder: async function (orderData, products, totals) {
        try {
            console.log(orderData, products, totals)
            let status = orderData.paymentMethod === 'Cash On Delivery' ? 'Placed' : 'Failed'
            const totalAmount = Number(totals.totalAmount)
            let orderObj = {
                deliveryDetails: {
                    name: orderData.name,
                    mobile: orderData.mobile,
                    pinCode: orderData.pinCode,
                    address: orderData.address,
                    state: orderData.state,
                    landmark: orderData.landmark,
                    alternativePhone: orderData.alternativePhone
                },
                userId: new ObjectId(orderData.userId),
                totalItems: totals.totalQuantity,
                totalAmount: totalAmount,
                paymentMethod: orderData.paymentMethod,
                date: new Date().toISOString(),
                products: products,
                status: status,
                paymentStatus: 'Payment Failed'
            }
            const response = await db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj)
            await db.get().collection(collection.CART_COLLECTION).deleteOne({user: new ObjectId(orderData.userId)})
            return {
                orderId: response.insertedId,
                totalAmount: totalAmount
            };
        } catch (err) {
            console.log(err)
        }

    },

    getOrdersData: async function (userId) {
        try {
            userId = new ObjectId(userId)
            const orders = await db.get().collection(collection.ORDER_COLLECTION)
                .find({userId: new ObjectId(userId)}).toArray()

            orders.forEach(order => {
                order.formattedDate = new Date(order.date).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: "short",
                    day: "numeric",
                });
                order.shortId = order._id.toString().slice(-6).toUpperCase();
            });

            return orders
        } catch (err) {
            console.log(err)
        }

    },

    getOrderDetails: async function (userId, orderId) {
        try {
            userId = new ObjectId(userId)
            orderId = new ObjectId(orderId)
            let orders = await db.get().collection(collection.ORDER_COLLECTION).findOne({userId: userId, _id: orderId})
            orders.formattedDate = new Date(orders.date).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: "long",
                day: "numeric",
            });
            orders.formattedTime = new Date(orders.date).toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            }).toUpperCase()
            const INRformatter = new Intl.NumberFormat("en-IN", {
                style: 'currency',
                currency: 'INR',
                minimumFractionDigits: 0,
            })
            orders.products.forEach(product => {
                product.formattedPrice = INRformatter.format(Number(product.price))
                product.formattedTotalPrice = INRformatter.format(Number(product.totalPrice))
            })
            orders.formattedTotalAmount = INRformatter.format(Number(orders.totalAmount))
            orders.shortId = orders._id.toString().slice(-6).toUpperCase();
            orders.productNo = orders.products.length
            return orders
        } catch (err) {
            console.log(err)
        }


    },

    generateRazorpay: async function (orderId, total) {
        try {
            orderId = new ObjectId(orderId)
            total=Number(total)
            const order = await instance.orders.create({
                amount: total * 100,
                currency: "INR",
                receipt: orderId,
            })
            console.log('New order : ', order)
            await db.get().collection(collection.ORDER_COLLECTION).updateOne(
                { _id: orderId},
                { $set: { razorpayOrderId: order.id } }
            );

            return order
        } catch (err) {
            console.log(err)
        }
    },

    verifyPayment: async (data) => {
        try {
            const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            hmac.update(data.razorpay_order_id + "|" + data.razorpay_payment_id);
            const generated_signature = hmac.digest('hex')
            if (generated_signature === data.razorpay_signature) {
                return true
            }else return false
        } catch (err) {
            console.log(err)
        }
    },

    changePaymentStatus: async function (razorpayOrderId, paymentStatus) {
        try {
            db.get().collection(collection.ORDER_COLLECTION).updateOne(
                {razorpayOrderId: razorpayOrderId},
                {$set:{paymentStatus: paymentStatus}}
            )
        }catch(err) {
            console.log(err)
        }
    },

    changeOrderStatus: async function (razorpayOrderId) {
        try {
            db.get().collection(collection.ORDER_COLLECTION).updateOne(
                {razorpayOrderId: razorpayOrderId},
                { $set: { status: 'Placed' } }
            )
        }catch(err) {
            console.log(err)
        }
    }
}