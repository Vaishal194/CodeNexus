import express from "express"
import { authenticate } from "../middleware/autenticate.js"
import { requireAdmin } from "../middleware/requireAdmin.js"
import { updateTest,create ,remove,publish,fetchAll,fetchById,PublishedTests,fetchTestDetails,fetchTestQuestion, unPublish} from "../controllers/ContestController.js"
const router=express.Router()

router.use(authenticate,requireAdmin)
router.post("/create",authenticate,requireAdmin,create)
router.post("/remove/:id",authenticate,requireAdmin,remove)
router.post("/:testId/publish",authenticate,requireAdmin,publish)
router.get("/fetch",authenticate,requireAdmin,fetchAll)
router.get("/fetch/:id",authenticate,requireAdmin,fetchById)
router.get("/published",authenticate,requireAdmin,PublishedTests)
router.get("/details/:id",authenticate,requireAdmin,fetchTestDetails)
router.get("/fetch/question/:id",authenticate,requireAdmin,fetchTestQuestion)
router.put("/:testId/update",authenticate,requireAdmin,updateTest)
router.put("/:testId/unpublish",authenticate,requireAdmin,unPublish)
export default router