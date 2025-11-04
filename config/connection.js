const {MongoClient} = require('mongodb');
const state = {db: null}

module.exports.connect = async function () {
    const url = 'mongodb://localhost:27017';
    const dbname = 'shopping'

    try {
        const client = await MongoClient.connect(url);
        state.db = client.db(dbname);
    } catch (err) {
        throw err;
    }

}

module.exports.get = function () {
    return state.db
}
