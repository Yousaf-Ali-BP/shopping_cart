const db = require("../config/connection")
const collection = require('../config/collections')
const bcrypt = require('bcrypt')

module.exports = {
    dosignup: async (userdata) => {
        try {
            let user =await db.get().collection(collection.USER_COLLECTION).findOne({email:userdata.email})
            let response={}
            if(!user){
                response.status=true
                userdata.password = await bcrypt.hash(userdata.password, 10)
                db.get().collection(collection.USER_COLLECTION).insertOne(userdata)
                response.user = userdata
                return response
            }else {
                console.log('user already exist')
                return {status:false}
            }

        } catch (err) {
            console.log(err)
        }

    },
    dologin: async (userdata) => {
        let response = {}
        try {
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({email: userdata.email})
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
    }
}