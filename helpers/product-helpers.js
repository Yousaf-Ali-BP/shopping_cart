const db = require("../config/connection")
const collection = require('../config/collections')
const {ObjectId} = require('mongodb');

module.exports = {
    addProduct: async function (product) {
        try {
            let result = await db.get().collection(collection.PRODUCT_COLLECTION).insertOne(product)
            return result
        } catch (err) {
            console.log(err);
        }
    },
    getAllProducts: async function() {
        try {
            const products = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray();
            return products;
        } catch (err) {
            console.log(err);
        }

    },
    deleteProduct: async function (productId) {
        try {
            const response = await db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({_id: new ObjectId(productId)})
            return response
        } catch (err) {
            console.log(err);
        }

    },

    getProductById: async function (productId) {
        try {
            const product = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id: new ObjectId(productId)})
            return product
        } catch (err) {
            console.log(err);
        }
    },

    updateProduct: async function (productId, productDetails) {
        try {
            await db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id: new ObjectId(productId)},
                {
                    $set: {
                        name: productDetails.name,
                        category: productDetails.category,
                        price: productDetails.price,
                        description: productDetails.description
                    }
                }
            )
        } catch (err) {
            console.log(err);
        }
    },

    formatCurrency:function(items,fieldName) {
        try {
            const INRformatter=new Intl.NumberFormat("en-IN", {
                style: 'currency',
                currency: 'INR',
                minimumFractionDigits: 0,
            })

            return items.map(item=>({
                ...item,
                formattedPrice:INRformatter.format(Number(item[fieldName]))
            }))
        }catch(err){
            console.log(err);
        }

    },
}