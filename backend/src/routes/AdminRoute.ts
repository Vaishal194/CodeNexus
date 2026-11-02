import express from "express"
import { authenticate } from "../middleware/autenticate.js"
import { requireAdmin } from "../middleware/requireAdmin.js"
import { updateTest,create ,remove,publish,fetchAll,fetchById,PublishedTests,fetchTestDetails,fetchTestQuestion, unPublish} from "../controllers/ContestController.js"
import { fecthAttemptsByTestId, fetchDetailedResultByAttemptId, fetchResultByAttemptId } from "../controllers/TestAttemptAdminController.js"
import {addCase,getAllTestCasesById,getHiddenCasesById,getTestCasesById,removeCase} from "../controllers/TestCaseController.js"
import { postProblem } from "../controllers/ProblemController.js"
const router=express.Router()

router.use(authenticate,requireAdmin)
router.post("/contest/create",authenticate,requireAdmin,create)
router.post("/contest/remove/:id",authenticate,requireAdmin,remove)
router.post("/:testId/publish",authenticate,requireAdmin,publish)
router.get("/fetch",authenticate,requireAdmin,fetchAll)
router.get("/fetch/:id",authenticate,requireAdmin,fetchById)
router.get("/published",authenticate,requireAdmin,PublishedTests)
router.get("/details/:id",authenticate,requireAdmin,fetchTestDetails)
router.get("/fetch/question/:id",authenticate,requireAdmin,fetchTestQuestion)
router.put("/:testId/update",authenticate,requireAdmin,updateTest)
router.put("/:testId/unpublish",authenticate,requireAdmin,unPublish)
router.get("/:testId/attempts",authenticate,requireAdmin,fecthAttemptsByTestId)
router.get("/:attempt_id/result",authenticate,requireAdmin,fetchResultByAttemptId)
router.get("/:attemptId/detailedResult",authenticate,requireAdmin,fetchDetailedResultByAttemptId)

//Test Case routes
router.post("/test-case/add",authenticate,requireAdmin,addCase)
router.get("/test-case/remove/:id",authenticate,requireAdmin,removeCase)
router.get("/hidden/:id",authenticate,requireAdmin,getHiddenCasesById)
router.get("/:id",authenticate,requireAdmin,getTestCasesById)
router.get("/all/:id",authenticate,requireAdmin,getAllTestCasesById)

//Post Problems
router.post("/problems/create",authenticate,requireAdmin,postProblem)
export default router