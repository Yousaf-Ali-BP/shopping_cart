const { MongoClient } = require('mongodb');

const state = {
    db: null
}

module.exports.connect = async function () {
    try {
        const url = process.env.MONGO_URL;
        const dbname = process.env.MONGO_DB_NAME;

        if (!url) {
            throw new Error("❌ MONGO_URL is missing in render environment variables");
        }

        if (!dbname) {
            throw new Error("❌ MONGO_DB_NAME is missing in render environment variables");
        }

        console.log("Trying to connect:", url, "DB:", dbname);

        const client = await MongoClient.connect(url);
        state.db = client.db(dbname);

        console.log("✅ MongoDB connected successfully!");
    } catch (err) {
        console.error("❌ Database connection failed:", err);
    }
};

module.exports.get = function () {
    return state.db;
};
