# CalorieCalculator Frontend

Cross-platform calorie tracking client built with Taro and React. The primary target is a WeChat Mini Program, and the project can also be built for H5 and other platforms supported by the configured Taro plugins.

## Technology stack

- Taro 4.2.0
- React 18
- Sass
- Webpack 5
- npm

## Features

- View today's food records and nutrition summary
- Browse and search the food catalog
- Add multiple foods through a temporary cart
- Edit food weights or delete daily records
- Create, edit, and delete custom foods
- Calculate calories, protein, carbohydrates, and fat through the backend API

## Prerequisites

- Node.js 18 or newer
- npm
- A running CalorieCalculator backend
- WeChat Developer Tools for Mini Program development

## API configuration

The client reads `TARO_APP_API_BASE` and falls back to `http://localhost:8080/api`.

Development configuration in `.env.development`:

```dotenv
TARO_APP_API_BASE="http://localhost:8080/api"
```

Production configuration in `.env.production` points to the deployed Railway backend. Change it before deploying to a different host.

For a physical phone or Mini Program device preview, `localhost` refers to the phone itself, not the development computer. Use the computer's LAN IP, for example `http://192.168.1.20:8080/api`, and make sure the firewall allows port 8080. WeChat production requests also require an HTTPS domain registered in the Mini Program console.

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
npm run build:weapp
npm run build:h5
```

Other configured targets include Alipay, ByteDance, Baidu Swan, QQ, JD, React Native, and Harmony hybrid. See `package.json` for their scripts.

## Project structure

```text
src/
  components/       Shared daily-list and nutrition components
  pages/index/      Today's records and nutrition summary
  pages/addFood/    Food browser, search, cart, and custom foods
  services/api.js   Backend HTTP requests and API base URL
  utils/date.js     Date helper
config/             Taro development and production configuration
dist/               Generated platform build output
```

## Backend integration

The frontend expects the backend at `http://localhost:8080/api` during local development. Confirm it is running before starting the client:

```powershell
Invoke-RestMethod "http://localhost:8080/api/foods/page?page=1&size=10"
```

If requests fail:

- Verify PostgreSQL and the Spring Boot backend are running.
- Verify `.env.development` contains the correct API URL.
- Restart the Taro watcher after changing an `.env` file.
- For device testing, replace `localhost` with the computer's LAN IP.
- Check Windows Firewall and WeChat request-domain restrictions.

## Related project

The sibling `CalorieCalculator-backend` directory contains the Spring Boot API and its database setup instructions.