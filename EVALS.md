# AgriAgent Africa — Evaluation Log

## 1. Evaluation environment

- **Project:** AgriAgent Africa
- **Use case:** Climate-smart agricultural advisory with extension-officer review
- **Environment:** Deployed frontend and backend on Render
- **Data:** Synthetic demo household and field records
- **Evaluation type:** Manual functional tests
- **Important limitation:** These tests verify prototype behavior, not real-world agricultural accuracy.

## 2. Test results

| ID | Test task | Expected result | Observed result | Status |
|---|---|---|---|---|
| E01 | Check backend health | API returns a healthy status | `/health` returned `status: ok` and identified synthetic demo records | PASS |
| E02 | Retrieve household evidence | Return field, rainfall, soil moisture, crop, and market fields | Evidence endpoint returned the expected synthetic maize-plot record | PASS |
| E03 | Load deployed advisory-review page | Evidence, advisory queue, and audit trail load | Initially failed because the backend CORS configuration did not allow the deployed frontend origin; loaded after the CORS fix was deployed | PASS after fix |
| E04 | Generate an advisory draft | Create a pending draft with supporting evidence and limitations | A draft was generated with elevated demo risk, cited rainfall and soil-moisture records, and disclosed limitations | PASS |
| E05 | Record an officer review | Save the officer's decision and review note | A demo officer review was recorded and the advisory displayed its reviewer, timestamp, and note | PASS |
| E06 | Verify audit logging | Record the review action and outcome | Audit trail displayed `review_advisory` with outcome `success` and the reviewing officer as actor | PASS |
| E07 | Prevent duplicate pending drafts in the UI | Warn when another draft is awaiting review | A second generation attempt displayed the duplicate-draft warning | PASS |
| E08 | Verify synthetic-data disclosures | Clearly distinguish demo values from live observations | Page identified synthetic household records, illustrative market prices, and disconnected satellite and sensor data | PASS |
| E09 | Enforce duplicate prevention at the backend | Reject duplicate pending drafts even when requests bypass the frontend | Not yet tested or implemented as a verified backend safeguard | NOT VERIFIED |
| E10 | Send an advisory to a real farmer | Require officer approval before any external delivery | No SMS or external message is sent by this prototype screen | NOT IMPLEMENTED |
| E11 | Verify open-weights model workflow | Complete an end-to-end task using the selected open-weights model | End-to-end model execution has not yet been verified | NOT VERIFIED |
| E12 | Verify the three own-MCP tools and borrowed MCP integration | Demonstrate tool calls and log relevant actions | Complete tool coverage and successful integration have not yet been verified | NOT VERIFIED |

## 3. Known limitations

- Household, rainfall, and soil-moisture records are synthetic.
- Market prices are illustrative, not verified current market quotes.
- No live soil sensor or satellite observation is connected.
- The advisory risk score is rule-based and has not been validated as a predictive model.
- The duplicate-pending-draft safeguard currently verified is in the frontend. Backend enforcement remains to be implemented and tested.
- Officer-name attribution is not authentication; reviewer identity and authorization need stronger controls.
- Real farmer messaging, input ordering, and other external actions are not enabled.
- Open-weights model execution and complete MCP integration still require end-to-end verification.
- Manual prototype tests do not establish that recommendations improve yields, income, or food security.

## 4. Unresolved failure and next approach

**Failure:** The deployed advisory-review page initially failed to retrieve API data because the backend CORS configuration did not allow the deployed frontend origin.

**Resolution:** The backend CORS configuration was updated to include the deployed frontend origin. After deployment, household evidence loaded, a new advisory draft was generated, and the frontend duplicate-draft warning was verified.

**Next approach:** Add server-side duplicate-pending-draft enforcement, then test the API directly to confirm that duplicate requests are rejected even when they do not pass through the frontend. Continue with end-to-end verification of the open-weights model and MCP tools.

## 5. Evaluation policy

Only mark a test PASS when its expected behavior has been observed. Keep untested integrations marked NOT VERIFIED until evidence is available. Repeat the manual tests after significant backend or frontend changes.
