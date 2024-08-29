import express from 'express'
import * as controllers from '../../controllers/web/transactions.controllers.js'

const router = express.Router()

router.post('/fetchAllUserTractions', controllers.fetchAllUserTractions)
router.post('/fetchAUserTraction/:id', controllers.fetchAUserTraction )




export default router