import express from "express"
import { authenticate } from "../middleware/autenticate.js"
import { requireAdmin } from "../middleware/requireAdmin.js"
import { updateTest,create ,remove,publish,fetchAll,fetchById,PublishedTests,fetchTestDetails,fetchTestQuestion, unPublish, addQuestion, deleteQuestion} from "../controllers/ContestController.js"
import { fecthAttemptsByTestId, fetchDetailedResultByAttemptId, fetchResultByAttemptId } from "../controllers/TestAttemptAdminController.js"
import {addCase,getAllTestCasesById,getHiddenCasesById,getTestCasesById,removeCase} from "../controllers/TestCaseController.js"
import { deleteProblemById, postProblem, updateProblemById } from "../controllers/ProblemController.js"
import { getResult } from "../controllers/TestResultController.js"
const router=express.Router()

router.use(authenticate,requireAdmin)
router.post("/contest/create",create)
router.delete("/contest/remove/:id",remove)
router.post("/:testId/publish",publish)
router.get("/fetch",fetchAll)
router.get("/fetch/:id",fetchById)
router.get("/published",PublishedTests)
router.get("/details/:id",fetchTestDetails)
router.get("/fetch/question/:id",fetchTestQuestion)
router.put("/:testId/update",updateTest)
router.put("/:testId/unpublish",unPublish)
router.get("/:testId/attempts",fecthAttemptsByTestId)
router.get("/:attempt_id/result",fetchResultByAttemptId)
router.get("/:attemptId/detailedResult",fetchDetailedResultByAttemptId)
router.get("/:attemptId/result",getResult)

//Test Case routes
router.post("/test-case/add",addCase)
router.delete("/test-case/remove/:id",removeCase)
router.get("/hidden/:id",getHiddenCasesById)
router.get("/:id",getTestCasesById)
router.get("/all/:id",getAllTestCasesById)

//Post Problems
router.post("/problems/create",postProblem)
router.delete("/problems/:problem_id/delete",deleteProblemById)
router.put("/problems/:problemId/update",updateProblemById)

//contest Coding question add/delete routes
router.post("/contest/add/:test_id",addQuestion)
router.delete("/contest/delete/:problem_id/:test_id",deleteQuestion)
export default router