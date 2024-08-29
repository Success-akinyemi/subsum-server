import express from 'express'
import * as controllers from '../../controllers/web/airtimeToCash.controllers.js'

const router = express.Router()

router.post('/convertAirtimeToCash',  controllers.convertAirtimeToCash)




//PUT ROUTES

export default router