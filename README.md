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

## Prerequisites

- Node.js 18 or newer
- npm
- A running CalorieCalculator backend
- WeChat Developer Tools for Mini Program development

## API configuration

The client reads `TARO_APP_API_BASE` and falls back to `http://localhost:8080/api`.

The checked-in development and production environment files currently point to the Tencent Cloud HTTP IP endpoint for experience-version testing:

```dotenv
TARO_APP_API_BASE="http://124.221.90.240/api"
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

- 11 source-level frontend tests pass.
- The production WeChat build and bundle compatibility check pass, and the generated API URL is the Tencent Cloud backend rather than localhost.
- The body-weight backend is deployed and healthy in production.
- The updated `dist` package has not yet been uploaded as a new WeChat experience version; this remains a manual user step.
- The H5 production build passes with the existing entrypoint-size warning. In-app visual browser QA could not start because of a Windows sandbox setup failure, so no visual-browser approval is claimed.

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
  services/api.js   Backend HTTP requests and API base URL
  utils/            Local-date, natural-month, and API-response helpers
tests/              API response, calendar, weight-trend, and WeChat bundle compatibility tests
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

1. Complete domain real-name verification and ICP filing.
2. Point an API subdomain to the Tencent Cloud server.
3. Configure a trusted TLS certificate and HTTPS on Nginx.
4. Change `.env.production` to the HTTPS API URL.
5. Register the HTTPS origin as the WeChat `request` legal domain.
6. Run `npm run verify:weapp`.
7. Test on a physical device with Developer Debugging disabled.
8. Upload, submit for review, and publish through WeChat Developer Tools and the Mini Program console.
## Related project


The sibling `CalorieCalculator-backend` directory contains the Spring Boot API and its database setup instructions.