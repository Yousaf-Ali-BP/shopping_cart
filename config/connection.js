const {MongoClient} = require('mongodb');
const state = {db: null}

module.exports.connect = async function () {
    const url = process.env.MONGO_URL;
    const dbname = process.env.MONGO_DB_NAME
    const client = await MongoClient.connect(url);
        state.db = client.db(dbname);
}

module.exports.get = function () {
    return state.db
}
