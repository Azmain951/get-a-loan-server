const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express()
const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());

const uri = "mongodb+srv://dbuser1:R5K0m7Y84uCB7R2n@cluster0.0aot6.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'Unauthorize Access' });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: 'Forbidden Access' })
        }
        req.decoded = decoded;
        next();
    });
}


async function run() {
    try {
        await client.connect();
        const loanCollection = client.db('get-a-loan').collection('loan');
        const userCollection = client.db('get-a-loan').collection('users');


        // const verifyAdmin = async (req, res, next) => {
        //     const requester = req.decoded.email;
        //     const requesterAccount = await userCollection.findOne({ email: requester });
        //     if (requesterAccount.role === 'admin') {
        //         next();
        //     }
        //     else {
        //         res.status(403).send({ message: 'Forbidden Access' });
        //     }
        // }

        app.get('/loan', async (req, res) => {
            const loans = await loanCollection.find().toArray();
            res.send(loans);
        });

        app.get('/loan/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email };
            const result = await loanCollection.findOne(query);
            res.send(result);
        });

        app.post('/loan', async (req, res) => {
            const application = req.body;
            console.log(application);
            const result = await loanCollection.insertOne(application);
            res.send(result);
        });

    }
    finally {

    }
}
run().catch(console.dir)


app.get('/', (req, res) => {
    res.send('Hello from GET-A-LOAN! Go to /loan');
})

app.listen(port, () => {
    console.log(`Doctor app listening on port ${port}`)
})
