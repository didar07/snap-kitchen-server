const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

require('dotenv').config()

const app = express()
const port = process.env.PORT || 5000

app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.xq1hd1p.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri)
const client = new MongoClient(uri, {
    useNewUrlParser: true, useUnifiedTopology: true,

});

// function verifyJWT(req, res, next) {
//     const authHeader = req.headers.authorization
//     if (!authHeader) {
//         return res.status(401).send({ message: 'unauthorized access' })
//     }
//     const token = authHeader.split(' ')[1]
//     jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
//         if (err) {
//             res.status(403).send({ message: 'unauthorized access' })
//         }
//         req.decoded = decoded
//         next()
//     })
// }

async function run() {
    try {
        const serviceCollection = client.db('snapKitchen').collection('services')
        const reviewCollection = client.db('snapKitchen').collection('reviews')

        app.post('/jwt', (req, res) => {
            const user = req.body
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '7d' })
            res.send({ token })
        })


        // for threee services
        app.get('/services', async (req, res) => {
            const query = {}
            const cursor = serviceCollection.find(query)
            const services = await cursor.limit(3).toArray()
            res.send(services)
        })

        // for all services
        app.get('/allservice', async (req, res) => {
            const query = {}
            const cursor = serviceCollection.find(query)
            const services = await cursor.toArray()
            res.send(services)
        })

        // services api 
        app.post('/allservice', async (req, res) => {
            const service = req.body
            const result = await serviceCollection.insertOne(service)
            res.send(result)
        })


        // for single services
        app.get('/allservice/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const singleService = await serviceCollection.findOne(query)
            res.send(singleService)
        })


        // get all reviews
        app.get('/reviews', async (req, res) => {
            const query = {}
            const cursor = reviewCollection.find(query)
            // sort({reviews: -1})
            const reviews = await cursor.toArray()
            res.send(reviews)
        })

        // my reviews only user can see
        app.get('/myreviews', async (req, res) => {

            let query = {}
            if (req.query.email) {
                query = {
                    email: req.query.email
                }
            }
            const cursor = reviewCollection.find(query)
            const myreviews = await cursor.toArray()
            res.send(myreviews)
        })


        // for update the review
        app.patch('/myreviews/:id', async (req, res) => {
            const id = req.params.id
            const message = req.body.message
            const query = { _id: ObjectId(id) }
            const updatedDoc = {
                $set: {
                    message: message
                }
            }
            const result = await reviewCollection.updateOne(query, updatedDoc)
            res.send(result)


        })

        // for delete the review
        app.delete('/myreviews/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await reviewCollection.deleteOne(query)
            res.send(result)
        })


        // review api 
        app.post('/reviews', async (req, res) => {
            const review = req.body
            const result = await reviewCollection.insertOne(review)
            res.send(result)
        })

    }
    finally {

    }
}
run().catch(err => console.error(err))

app.get('/', (req, res) => {
    res.send('snap kitchen serer running',)
})

app.listen(port, () => {
    console.log(`snap kitchen server running on ${port}`)
})