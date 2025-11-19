const db = require("../config/connection")
const collection = require('../config/collections')
const bcrypt = require('bcrypt')


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
    }

}