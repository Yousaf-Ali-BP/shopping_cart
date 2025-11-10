const db = require("../config/connection")
const collection = require('../config/collections')
const bcrypt = require('bcrypt')
const {ObjectId} = require('mongodb');
const {log} = require("debug");

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
                    console.log('login success : ' + status)
                    response.user = user
                    response.status = true
                    return response
                } else {
                    console.log('login fail : ' + status)
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
                        quantity: '$products.quantity'
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
                {$project: {quantity:'$products.quantity'}}
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
                {$project: {quantity:'$products.quantity'}}
            ]).toArray()
            return result[0].quantity

        } catch (err) {
            console.log(err)
        }
    }

}