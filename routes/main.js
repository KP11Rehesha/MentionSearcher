const express = require('express');
const router = express.Router();
const { MongoClient } = require('mongodb');

const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);
const dbName = 'testdb';

router.get('/', (req, res) => {
    res.render('index');
});

router.post('/add', async (req, res) => {
    const { name, age, comment } = req.body;
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('mentions');
        await collection.insertOne({
            name,
            age: parseInt(age, 10),
            comment,
            dateAdded: new Date()
        });
        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.status(500).send('Помилка при додаванні даних');
    } finally {
        await client.close();
    }
});

router.get('/mentions', async (req, res) => {
    try {
        await client.connect();
        const db = client.db(dbName);
        const mentions = await db.collection('mentions').find().toArray();
        res.render('mentions', { mentions });
    } catch (err) {
        console.error(err);
        res.status(500).send('Помилка при отриманні даних');
    } finally {
        await client.close();
    }
});

module.exports = router;
