const http = require('http');
const fs = require('fs');
const { MongoClient } = require('mongodb');
const url = require('url');
const querystring = require('querystring');

const port = 3000;
const uri = 'mongodb://localhost:27017';

const client = new MongoClient(uri);

const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url);

    if (req.method === 'GET' && parsedUrl.pathname === '/') {
        const html = fs.readFileSync('./index.html', 'utf8');
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(html);

    } else if (req.method === 'POST' && parsedUrl.pathname === '/add') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            const formData = querystring.parse(body);
            const { name, age, comment } = formData;

            try {
                await client.connect();
                const db = client.db('testdb');
                const collection = db.collection('mentions');
                await collection.insertOne({
                    name,
                    age: parseInt(age, 10),
                    comment,
                    dateAdded: new Date()
                });
                res.writeHead(302, { Location: '/' });
                res.end();
            } catch (err) {
                console.error(err);
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Помилка при додаванні даних');
            } finally {
                await client.close();
            }
        });

    } else if (req.method === 'GET' && parsedUrl.pathname === '/mentions') {
        try {
            await client.connect();
            const db = client.db('testdb');
            const collection = db.collection('mentions');
            const mentions = await collection.find().toArray();

            let mentionsHtml = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Згадки</title></head><body>';
            mentionsHtml += '<h1>Усі згадки</h1><ul>';

            mentions.forEach(m => {
                mentionsHtml += `<li><strong>${m.name}</strong>, ${m.age} рік — ${m.comment}</li>`;
            });

            mentionsHtml += '</ul><a href="/">Назад на головну</a></body></html>';

            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(mentionsHtml);
        } catch (err) {
            console.error(err);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Помилка при отриманні даних');
        } finally {
            await client.close();
        }
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Сторінку не знайдено');
    }
});

server.listen(port, () => {
    console.log(`Сервер запущено на http://localhost:${port}`);
});
