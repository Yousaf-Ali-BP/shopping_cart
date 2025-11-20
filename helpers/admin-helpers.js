const db = require("../config/connection")
const collection = require('../config/collections')
const bcrypt = require('bcrypt')
const {ObjectId} = require('mongodb');


module.exports = {

    dologin: async (data) => {
        try{
            const response={}
            const admin=await db.get().collection(collection.ADMINS_COLLECTION).findOne({email:data.email})
            if(admin){
                const status=await bcrypt.compare(data.password,admin.password)
                if(status){
                    response.admin=admin
                    response.status=true
                    return response
                }else {
                    return {status:false}
                }
            }else {
                return {status:false}
            }
        }catch(err){
            console.log(err)
        }
    },

    getAllOrders: async () => {
        try{
            const orders = await db.get().collection(collection.ORDER_COLLECTION).find().toArray()

            orders.forEach(order => {
                order.formattedDate = new Date(order.date).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: "short",
                    day: "numeric",
                });
                const INRformatter = new Intl.NumberFormat("en-IN", {
                    style: 'currency',
                    currency: 'INR',
                    minimumFractionDigits: 0,
                })
                order.formattedTotalAmount = INRformatter.format(Number(order.totalAmount))
                order.shortId = order._id.toString().slice(-6).toUpperCase();
            })
            return orders
        }catch(err){
            console.log(err)
        }
    },

    getUser: async (orderId) => {
        orderId=new ObjectId(orderId);
        const order=await db.get().collection(collection.ORDER_COLLECTION).findOne({_id:orderId})
        return await db.get().collection(collection.USER_COLLECTION).findOne({_id:order.userId})
    },

    getAllUsers: async () => {
        try {
            return await db.get().collection(collection.USER_COLLECTION).find().toArray()
        }catch(err){
            console.log(err)
        }

    }

}