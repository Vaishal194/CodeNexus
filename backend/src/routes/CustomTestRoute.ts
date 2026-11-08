import express from "express"
import { createCustomTest ,deleteCustomTest,fetchCustomTestsByID,fetchTestByOwner,publish,unPublish,updateCustomTest} from "../controllers/CustomTestController.js"
import { authenticate } from "../middleware/autenticate.js"
import { addCustomCodingQuestion, addCustomMcqQuestion, linkCustomProblem, removeCustomQuestion } from "../controllers/CustomTestQuestionController.js"
const router=express.Router()

router.use(authenticate)
router.post("/create-test",createCustomTest)
router.delete("/delete/:test_id",deleteCustomTest)
router.put("/update/:test_id",updateCustomTest)
router.get("/fetch-all",fetchTestByOwner)
router.get("/fetch/:test_id",fetchCustomTestsByID)
router.put("/publish/:test_id",publish)
router.put("/unpublish/:test_id",unPublish)

// Owner-scoped question authoring for custom tests
router.post("/:test_id/questions/mcq",addCustomMcqQuestion)
router.post("/:test_id/questions/coding",addCustomCodingQuestion)
router.post("/:test_id/questions/link",linkCustomProblem)
router.delete("/:test_id/questions/:test_question_id",removeCustomQuestion)
export default router