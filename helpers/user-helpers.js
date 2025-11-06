const db = require("../config/connection")
const collection = require('../config/collections')
const bcrypt = require('bcrypt')
const {ObjectId} = require('mongodb');

module.exports = {
    dosignup: async (userdata) => {
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
    dologin: async (userdata) => {
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

    addToCart: async (productId, userId) => {
        try {
            userId = new ObjectId(userId)
            productId = new ObjectId(productId)
            const userCart = await db.get().collection(collection.CART_COLLECTION).findOne({user: userId})
            if (userCart) {
                return await db.get().collection(collection.CART_COLLECTION).updateOne({user: userId}, {$push: {products: productId}})
            } else {
                let cartObj = {
                    user: userId,
                    products: [productId]
                }
                return await db.get().collection(collection.CART_COLLECTION).insertOne(cartObj)
            }
        } catch (err) {
            console.log(err)
        }
    },

    getCartProducts: async (userId) => {
        try {
            userId = new ObjectId(userId)
            const cartItems = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: {user: userId}
                },
                {
                    $lookup: {
                        from:collection.PRODUCT_COLLECTION,
                        localField: 'products',
                        foreignField: '_id',
                        as:'cartItems'
                    }
                }
            ]).toArray()
            return cartItems[0].cartItems
        }catch(err) {
            console.log(err)
        }
    },

    getCartCount: async (userId) => {
        userId=new ObjectId(userId)
        let count = 0
        try {
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({user: userId})
            if (cart) {
                count=cart.products.length
                return count
            }
        }catch(err) {
            console.log(err)
        }
    }


}