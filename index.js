import express from "express";
import { config } from 'dotenv';
config();
import cookieParser from 'cookie-parser'
import cors from 'cors'
import authRoute from './routes/web/auth.routes.js'
import userRoute from './routes/web/user.routes.js'
import transactionRoute from './routes/web/transactions.routes.js'
import airtimeToCashRoute from './routes/web/airtimeToCash.routes.js'

//DOCs
import swaggerUI from 'swagger-ui-express';
import YAML from 'yamljs';
const swaggerJSDocs = YAML.load('./api.yaml');

const app = express()

app.use('/api-doc',swaggerUI.serve,swaggerUI.setup(swaggerJSDocs))
app.use(express.json())
app.use(cookieParser())
const allowedOrigins = [
    process.env.CLIENT_URL,
    process.env.NEBOUR_URL,
    process.env.CLIENT_URL2,
    process.env.CLIENT_URL3,
];
app.use((req, res, next) => {
    const origin = req.headers.origin;
    console.log('ORIGIN', origin)

    if (allowedOrigins.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
          return
        }
      },    
    credentials: true,
};

app.use(cors(corsOptions));


const PORT = process.env.PORT || 9000

//Import DB
import './connection/db.js'

/**HTTP get request */
app.get('/', (req, res) => {
    res.status(200).json('Home GET Request welcome to subsum')
})

/**ROUTES */
//WEB
app.use('/api/web/auth', authRoute)
app.use('/api/web/user', userRoute)
app.use('/api/web/transaction', transactionRoute)
app.use('/api/web/airtimeToCash', airtimeToCashRoute
  
)



//INSTAGRAM




app.listen(PORT, () => {
    console.log(`Server runing on port http://localhost:${PORT}`)
})