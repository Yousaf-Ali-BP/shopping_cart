const {MongoClient, ServerApiVersion} = require('mongodb');
const state = {
    db: null
}

module.exports = {
    connect: async () => {
        try {
            const uri = process.env.MONGO_URL;
            const dbName = process.env.MONGO_DB_NAME;
            console.log("Connecting to:", uri);
            const client = await MongoClient.connect(uri, {
                ssl: true,
                maxPoolSize: 10,
            });
            state.db = client.db(dbName);
            console.log(`✅ Connected to MongoDB database: ${dbName}`);
        } catch (err) {
            console.error("❌ Database connection failed:", err);
        }
    },
    get : function () {
        return state.db;
    }



}

