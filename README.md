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

- 19 source-level frontend tests pass, including single-flight login, bounded 401 recovery, and circumference payload validation.
- The production WeChat build and bundle compatibility check pass with the authenticated request wrapper and HTTPS API origin; targeted ESLint and Stylelint also pass.
- Backend PR #25 and frontend PR #31 are merged. The authenticated backend, additive ownership migration, login hotfix, original-owner login, and guarded legacy-data claim are deployed and verified.
- The original owner confirmed calendar and circumference save behavior after rebuilding and recompiling the WeChat package.
- The pre-authentication experience version `1.1.2` remains unsuitable for review. Only the authenticated accepted build may be submitted after two-real-account isolation and privacy-guide completion.

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

The domain, ICP filing, trusted HTTPS endpoint, production API configuration, WeChat `request` legal domain, authenticated backend rollout, original-owner login, guarded historical-data claim, and single-account physical regression are complete.

Remaining formal-release gates:

1. Use a second real WeChat account to confirm an empty/private initial state and colliding-date isolation for read, update, delete, carry-forward, and trend behavior; then verify permanent deletion of that second test account.
2. Complete the WeChat privacy-protection guide and rerun the final physical-device regression without Developer Debugging.
3. Submit only the authenticated accepted build for formal review, then publish after approval.

If WeChat DevTools reports that `dist/app.json` is missing while `miniprogramRoot` is `dist/`, wait for the Taro build to finish. `verify:weapp` clears and rebuilds `dist`; launching the simulator during that window produces a transient failure. Confirm `dist/app.json` exists, use Normal Compile, and reopen the project if a stale simulator state remains.
## Related project


The sibling `CalorieCalculator-backend` directory contains the Spring Boot API and its database setup instructions.
