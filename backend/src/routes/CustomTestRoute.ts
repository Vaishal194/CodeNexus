import express from "express"
import { createCustomTest ,deleteCustomTest,fetchCustomTestsByID,fetchTestByOwner,publish,unPublish,updateCustomTest} from "../controllers/CustomTestController.js"
import { authenticate } from "../middleware/autenticate.js"
const router=express.Router()

router.use(authenticate)
router.post("/create-test",createCustomTest)
router.delete("/delete/:test_id",deleteCustomTest)
router.put("/update/:test_id",updateCustomTest)
router.get("/fetch-all",fetchTestByOwner)
router.get("/fetch/:test_id",fetchCustomTestsByID)
router.put("/publish/:test_id",publish)
router.put("/unpublish/:test_id",unPublish)
export default router