# Production HTTPS API plan

Date: 2026-08-04

Issue: #27

## Goal

Move the formal WeChat Mini Program build from the raw HTTP IP endpoint to the filed HTTPS API domain.

## Work

1. Change only the production API base URL to https://api.caloriecalculator.top/api.
2. Keep local development behavior unchanged.
3. Run source tests and the WeChat production compatibility build.
4. Confirm the generated bundle contains the HTTPS domain and no production HTTP IP URL.
5. Document the WeChat request legal-domain and real-device verification steps.
