# CodeNexus – Backend Issues and Integration Blockers

## Review scope

Reviewed the uploaded `backebd.zip` (Express + TypeScript source, routes, controllers, services, interfaces, runners, and server mount points). This review is based only on the uploaded source. No frontend source was included in this upload, so frontend-specific bugs cannot yet be verified. The backend package includes source and `package.json`, but no database schema/migrations or environment secrets; database constraints and runtime behavior should be verified separately.

**Severity:** P0 = security/data exposure; P1 = blocks or materially breaks a frontend flow; P2 = correctness/consistency/maintainability.

## P0 – Security issues to fix before production

1. **Hidden test-case endpoints are exposed without authentication.** `/testcase/hidden/:id` and `/testcase/all/:id` are mounted through `TestCaseRoute` without authentication. The `all` handler returns hidden and visible cases. The admin router also has protected copies, but the public routes remain exposed. Remove these public routes or protect them with admin authorization. Never send hidden inputs or expected outputs to a student browser.
2. **MCQ mutations are unauthenticated.** `POST /Mcq/add` and `DELETE /Mcq/remove/:id` have no `authenticate` or `requireAdmin` middleware. Restrict both to admins.
3. **Assessment-question mutations and reads are unauthenticated.** `/question/add`, `/question/remove/:id`, `/question/fetch`, and `/question/fetch/:id` have no access middleware. Protect mutations with admin authorization and define a deliberate policy for reads.
4. **Legacy result endpoint is unauthenticated and does not check ownership.** `GET /results/:attemptId/result` calls `getAttemptResult(attemptId)` without a user identity. Remove it or add authentication and ownership/admin checks. Student clients should use `GET /attempts/:attemptId/result` only after verifying its ownership behavior.
5. **Execution endpoint is unauthenticated.** `POST /execute/execute` has no authentication. Decide whether public execution is intended; otherwise protect it. In either case enforce request size, rate limits, validation, and runner resource/time limits.
6. **Public hidden-case exposure through admin/public route overlap.** Admin routes correctly use router-level `authenticate, requireAdmin`, but that does not protect the separate `/testcase` router. Fix the public router, not just the admin one.

## P1 – Frontend integration blockers / incorrect contracts

1. **Practice-problem list omits the problem ID.** `GET /prob/problems` is used by the problem list, but its service query selects only title, description and difficulty while the interface expects an ID. A frontend cannot reliably navigate from a list row to `/prob/problems/:id`. Return the actual primary key in the list response.
2. **Problem creation maps fields incorrectly.** `ProblemService.generateProblem` maps `description` into the difficulty field instead of using `data.difficulty` (verify exact implementation in `src/services/ProblemService.ts`). Correct the mapping and add input validation.
3. **Run and Submit are not distinct.** `POST /execute/execute` invokes the execution service over all test cases. The frontend requirement is Run = visible/sample cases and Submit = full suite including hidden cases. Implement separate safe behavior; hidden test data must remain server-side. Do not let the client choose or fetch hidden test cases.
4. **Assessment attempt retrieval does not return the questions.** `GET /attempts/:attemptId` returns attempt metadata. Assessment question retrieval is currently `GET /contest/fetch/question/:id`, where `:id` is a test ID, not an attempt ID. There is no endpoint that loads the question set using the active attempt ID. Add a student-authorized endpoint keyed by attempt ID, verify attempt ownership and active status, and return question content without answers/solutions.
5. **Student assessment-question route needs access checks.** `/contest/fetch/question/:id` is authenticated but its controller/service must be checked to ensure the student has a valid published test/attempt and cannot fetch answer keys or hidden coding tests. Authentication alone is not authorization.
6. **Student submission history is missing.** No endpoint was found to list a student's practice submissions with problem, language, timestamp, verdict and relevant run metadata. Keep the UI in an honest empty/integration-pending state until added.
7. **Standalone problem update/delete endpoints are missing.** 
8. **Question fetch response is not sufficient for a usable question editor/list.** `GET /question/fetch` returns test-question link rows rather than joined MCQ/coding question content (check `TestQuestionService`). Admin frontend needs a joined representation or separate documented fetches.
9. **Assessment list/detail queries may omit IDs.** `ContestService` fetch/list queries should be checked: the current source review indicates admin fetch/list query projections omit assessment IDs in some paths. Ensure every assessment list/detail response includes the test primary key.
10. **Answer-save request has two competing attempt IDs.** Route is `POST /attempt/:attemptId/answers`, but `AttemptAnswerController` reads `attemptId` from `req.body` and ignores `req.params.attemptId`. Standardize on the path parameter (or document and consistently validate one source).
11. **Assessment code submission response shape differs from ordinary execution.** `POST /submit-code/submit` returns `{status, result}` and the service uses assessment-specific statuses. Document the exact nested `result` shape and normalize verdict mapping for the UI.
12. **Retakes appear to be rejected.** `startAttempt` handles the message “You have already started or attempted this test”; confirm the database uniqueness rule and product requirement. If retakes are intended, design attempt numbering/reset rules before building a retake UI.

## P2 – Controller correctness, HTTP semantics and validation

1. `AttemptAnswerController.saveAnswer` returns HTTP 201 when authentication is missing, despite being behind `authenticate`; should be 401 as a defensive fallback.
2. `CodeSubmissionController.submit` also returns 201 for missing authentication; should be 401.
3. `TestAttemptController.fetchResults` returns 201 for missing authentication and invalid attempt ID; use 401 and 400 respectively.
4. `TestQuestionController.deleteQuestion` and `fetchTestQuestionById` parse `req.params.body`, but the route parameter is named `:id`. Both will parse `undefined`/`NaN`. Use `req.params.id` and validate it.
5. Deleting a question is implemented as `GET /question/remove/:id`. Change to `DELETE` and protect it with admin authorization.
6. `ContestController.publish` and `unPublish` return 500 for invalid test IDs; use 400. Several other controllers return 201 for read operations; use 200 consistently for GET responses.
7. `ContestController.remove`, `TestCaseController.removeCase`, and similar mutation handlers should validate IDs and return 404 when the target does not exist rather than reporting generic 500 for all failures.
8. `TestCaseController.addCase` does not validate required fields (`problem_id`, input, expected output, `is_hidden`, sequence number) and does not return the created record. Add validation and a consistent response.
9. `TestQuestionController.addQuestion` should validate `question_type`, required `mcq_id`/`problem_id`, `test_id`, marks and sequence number, and ensure the referenced records exist. Enforce that MCQ questions have an MCQ reference and coding questions have a problem reference.
10. `MCQController`/`MCQService` should validate options JSON and `correct_option` bounds. Never expose `correct_option` or explanation in student question-fetch responses before submission unless explicitly intended.
11. `ContestController.create` should validate title, `total_marks`, duration and optional description; `update` should reject empty/invalid updates and return 404 for missing tests.
12. Numeric IDs are often converted with `Number(...)` but not checked for integer/positive values in every controller. Apply consistent validation.
13. Error responses vary (`status`, `message`, `error`, `result`); define a stable API response convention and document it for the frontend.
14. Several imports are unused (for example `node:test` in controllers); clean them up, but this is lower priority than correctness/security.

## Routes currently present (mount path + route path)

### Authentication

- `GET /api/auth/me` – authenticated; returns `{ id, email, role }`.
- `GET /api/auth/admin-check` – authenticated admin check.

### Practice problems

- `GET /prob/problems` – list; current response omits ID (bug).
- `GET /prob/problems/:id` – problem detail.
- `POST /api/admin/problems/create` – admin create.

### Execution

- `POST /execute/execute` – `{ problem_id, language, code }`; currently runs the execution service against all test cases; unauthenticated.

### Test cases

- `GET /testcase/:id` – visible test cases.
- `GET /testcase/hidden/:id` – hidden cases; currently public and unsafe.
- `GET /testcase/all/:id` – all cases; currently public and unsafe.
- Admin: `POST /api/admin/test-case/add`, `DELETE /api/admin/test-case/remove/:id`, `GET /api/admin/hidden/:id`, `GET /api/admin/:id`, `GET /api/admin/all/:id`.

### Assessments

- Student/authenticated: `GET /contest/published`, `GET /contest/details/:id`, `GET /contest/fetch/:id`, `GET /contest/fetch/question/:id`.
- Admin: `POST /api/admin/contest/create`, `DELETE /api/admin/contest/remove/:id`, `POST /api/admin/:testId/publish`, `PUT /api/admin/:testId/unpublish`, `GET /api/admin/fetch`, `GET /api/admin/fetch/:id`, `GET /api/admin/published`, `GET /api/admin/details/:id`, `GET /api/admin/fetch/question/:id`, `PUT /api/admin/:testId/update`, `GET /api/admin/:testId/attempts`, `GET /api/admin/:attempt_id/result`, `GET /api/admin/:attemptId/detailedResult`.

### Attempts and answers

- `POST /attempts/start` – `{ test_id }`.
- `GET /attempts/:attemptId` – attempt metadata.
- `POST /attempts/:attemptId/submit` – submit attempt.
- `GET /attempts/:attemptId/result` – student result.
- `POST /attempt/:attemptId/answers` – current controller expects body `{ attemptId, testQuestionId, selectedOption }`; route/body mismatch noted above.
- `POST /submit-code/submit` – `{ attemptId, testQuestionId, language, code }`.

### MCQs and test-question links

- `POST /Mcq/add`, `DELETE /Mcq/remove/:id` – currently unauthenticated.
- `POST /question/add`, `GET /question/remove/:id`, `GET /question/fetch/:id`, `GET /question/fetch` – currently unauthenticated; ID parsing bugs noted above.

### Legacy results

- `GET /results/:attemptId/result` – unauthenticated; remove or secure.

## Required verification before closing issues

- Run the backend against a test database and confirm actual table primary-key names and response payloads.
- Add integration tests for student vs admin access to every route.
- Verify that no student-facing endpoint returns hidden test inputs/expected outputs, MCQ correct answers, or coding solutions.
- Confirm C++, Java and Python are the only supported execution languages and publish exact language identifiers/runtime versions from runner configuration.
- Confirm all error status codes and payload shapes with Postman/automated tests.
