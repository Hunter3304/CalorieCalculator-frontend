# CalorieCalculator Frontend

Cross-platform calorie tracking client built with Taro and React. The primary target is a WeChat Mini Program, and the project can also be built for H5 and other platforms supported by the configured Taro plugins.

Project handoff, iteration history, and iteration plans are indexed in [`doc/README.md`](doc/README.md).

## Technology stack

- Taro 4.2.0
- React 18
- Sass
- Webpack 5
- npm

## Features

- View food records and nutrition totals for any selectable date
- Move one day at a time with disabled minimum and maximum boundaries
- Open a complete natural-month calendar and switch months
- Distinguish the selected date and dates that already contain records
- Backfill historical records and plan food records up to seven days ahead
- Browse and search the food catalog
- Save a selected food directly to the currently selected date
- Edit food weights or delete daily records
- Create, edit, and delete custom foods
- Calculate calories, protein, carbohydrates, and fat through the backend API
- Ignore stale API responses when users switch dates quickly
- Record, edit, and delete one body weight per date
- Show carried-forward weight on dates without a real record
- Explore rolling 7-day, 30-day, and 365-day body-weight trends
- Record any subset of six body-circumference measurements in centimeters
- View independently carried circumference values and select one measurement for trend analysis
- Sign in automatically through `Taro.login()` without storing a WeChat code or OpenID on the client
- Attach an opaque application session to every API request and retry authentication only once after a 401
- Review the in-app privacy explanation, revoke the current session, or permanently delete the account and personal data

## Prerequisites

- Node.js 18 or newer
- npm
- A running CalorieCalculator backend
- WeChat Developer Tools for Mini Program development

## API configuration

The client reads `TARO_APP_API_BASE` and falls back to `http://localhost:8080/api`.

The development environment keeps the Tencent Cloud HTTP IP endpoint for experience-version rollback. The production environment uses the filed HTTPS API domain:

```dotenv
TARO_APP_API_BASE="https://api.caloriecalculator.top/api"
```

The JavaScript fallback is used only when no environment value is injected. `npm run verify:weapp` verifies that the production bundle uses the configured Tencent Cloud API and does not contain unsupported optional-chaining or nullish-coalescing tokens.

The HTTP IP endpoint works only for approved development/experience accounts with Developer Debugging enabled. A formal release must use an ICP-filed HTTPS domain, for example `https://api.example.top/api`, and register `https://api.example.top` as the WeChat `request` domain without the `/api` path.

## Install dependencies

```powershell
npm install
```

The repository may already contain `node_modules`, but reinstalling from `package-lock.json` is recommended when dependencies are incomplete or another Node version was used.

## Run locally

Start the Spring Boot backend first on port 8080, then run one of the following commands.

WeChat Mini Program development build:

```powershell
npm run dev:weapp
```

Import the generated `dist` directory into WeChat Developer Tools.

H5 development build:

```powershell
npm run dev:h5
```

## Production builds

```powershell
D:\AAA\app\NodeJS\npm.cmd test
D:\AAA\app\NodeJS\npm.cmd run verify:weapp
D:\AAA\app\NodeJS\npm.cmd run build:h5
```

`verify:weapp` builds the WeChat production package into `dist/` and runs the bundle compatibility check. The user uploads `dist/` through WeChat Developer Tools; automated code changes do not publish a Mini Program version.

Current release status:

- 19 source-level frontend tests pass, including single-flight login and bounded 401 recovery.
- The production WeChat build and bundle compatibility check pass with the authenticated request wrapper and HTTPS API origin.
- The H5 production build passes with the existing 337 KiB entrypoint-size warning.
- The authentication/privacy implementation is ready for Pull Request review but is not yet deployed or uploaded as a new experience version.
- Experience version `1.1.2` remains tester-only because it predates user authentication and data isolation.

Other configured targets include Alipay, ByteDance, Baidu Swan, QQ, JD, React Native, and Harmony hybrid. See `package.json` for their scripts.

## Calendar behavior

- The backend provides `minDate`, `maxDate`, and recorded dates for the displayed month.
- Empty dates inside the range remain selectable and show zero totals.
- The add-food route receives the selected `yyyy-MM-dd` date explicitly.
- Returning from add-food preserves the selected date and refreshes the summary.
- Month grids support 28, 29, 30, and 31-day natural months with weekday alignment.
## Project structure


```text
src/
  components/       Daily-list, nutrition, and CalendarPicker components
  pages/index/      Date navigation, calendar, records, and nutrition summary
  pages/addFood/    Food browser, search, date-aware save, and custom foods
  pages/weightEditor/  Independent body-weight create/edit flow
  pages/weightTrend/   Presets, end-date calendar, and line chart
  pages/circumferenceEditor/  Six-field sparse circumference editor
  pages/circumferenceTrend/   Measurement selector, presets, calendar, and line chart
  pages/settings/   Privacy disclosure, logout, and destructive account deletion
  services/auth.js  WeChat code exchange, token storage, and authenticated requests
  services/api.js   Owner-scoped backend requests
  utils/            Date, API-response, and auth-session helpers
tests/              API, calendar, trend, authentication, and bundle-compatibility tests
config/             Taro development and production configuration
dist/               Generated platform build output
```

## Body-weight behavior

- The homepage uses two equal circular actions for adding food and recording weight.
- Weight belongs to the selected homepage date; future dates show an explanatory message instead of opening the editor.
- A selected date without a real weight displays the most recent earlier record and identifies its source date.
- Editing a carried value updates the actual source record. Delete is available only for a real record on the selected date.
- The trend page offers rolling 7-, 30-, and 365-day views ending on a selectable date no later than today.
- Dates before the first real weight remain blank; later missing dates carry the last real weight forward.
## Body-circumference behavior

- The homepage offers a third green action for recording chest, waist, hip, arm, thigh, and calf circumference.
- Every supplied value uses centimeters, must be positive, and accepts at most one decimal place.
- Fields are optional and inherit independently from their latest earlier real value; never-recorded fields display `--`.
- An all-blank new save creates no empty database row. Clearing a selected-date override makes that field fall back to an earlier value.
- The homepage card shows all six effective values. Deleting removes the selected date's complete sparse record.
- The trend page defaults to waist circumference and uses a dropdown to show one measurement across rolling 7-, 30-, or 365-day ranges.
## Backend integration

The checked-in environments use the Tencent Cloud backend. To run entirely locally, change `.env.development` to `http://localhost:8080/api`, start PostgreSQL and Spring Boot, and confirm the API before starting the client:

```powershell
Invoke-RestMethod "http://localhost:8080/api/foods/page?page=1&size=10"
```

If requests fail:

- Verify PostgreSQL and the Spring Boot backend are running.
- Verify `.env.development` contains the correct API URL.
- Restart the Taro watcher after changing an `.env` file.
- For device testing, use a network-reachable API; the current HTTP IP requires Developer Debugging in an experience version.
- Check Windows Firewall and WeChat request-domain restrictions.

## Formal release checklist

The domain, ICP filing, trusted HTTPS endpoint, production API configuration, WeChat `request` legal domain, and physical-device test without Developer Debugging are complete. Experience version `1.1.2` is suitable only for approved testers.

The code-level blockers are implemented: server-only WeChat code exchange, opaque sessions, owner-scoped data, privacy disclosure, logout, and account/data deletion. Formal public review remains blocked by the production and manual acceptance steps below:

1. Merge both authentication Pull Requests. Enter the AppSecret privately in the server environment; never put it in the client or chat.
2. Back up and verify PostgreSQL, apply the additive ownership migration, and deploy the authenticated backend during a maintenance window.
3. Upload the new experience build and let the original owner log in first; only then run the guarded legacy-data claim.
4. Test colliding dates and different values with two distinct WeChat accounts, including read/update/delete/carry-forward/trend isolation and account deletion.
5. Complete the WeChat privacy-protection guide, rerun physical-device regression without Developer Debugging, and only then submit the accepted version for formal review.
## Related project


The sibling `CalorieCalculator-backend` directory contains the Spring Boot API and its database setup instructions.