import express from 'express'
import * as controllers from '../../controllers/web/user.controllers.js'
import { Protect } from '../../middleware/auth.js'

const router = express.Router()

router.post('/updateUser', Protect, controllers.updateUser)


//GET ROUTES
router.get('/getAllUserReferrees', controllers.getAllUserReferrees )



//PUT ROUTES

export default router