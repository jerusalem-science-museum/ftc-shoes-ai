# ShoeImagineP

Local web app for the Bloomfield Science Museum shoe-imagination station.

The app runs fully on the local computer:

- React/Vite client: `http://127.0.0.1:5173`
- Express server: `http://localhost:8080`
- Generated images: `server/dalleImages`
- Gallery metadata: `server/data/posts.json`

No MongoDB and no Google Translate key are required.

## Requirements

- Node.js 20 or newer
- npm
- An OpenAI API key with image generation access

## First-Time Setup

From the project folder:

```bash
npm run setup
```

Then open `server/.env` and replace:

```bash
OPENAI_API_KEY=paste-your-api-key-here
```

with the museum API key.

You can also paste the key directly inside the app. If image generation is attempted without a configured key, the app shows an `OpenAI API key` field and saves the key locally to `server/.env`.

## Run Locally

```bash
npm run dev
```

Open:

```text
http://127.0.0.1:5173/create-post
```

If Vite says that port 5173 is already in use, open the `Local:` URL that Vite prints in the terminal.

On macOS, you can also double-click `start-local.command`. On Windows, use `start-local.bat`.

The Windows launcher checks for Node.js 20 or newer. If Node.js is missing or too old, it tries to install Node.js LTS with Windows Package Manager (`winget`). If automatic installation is unavailable, it opens the official Node.js download page.

## Configuration

Edit `server/.env`:

```bash
OPENAI_API_KEY=paste-your-api-key-here
PORT=8080
PUBLIC_SERVER_URL=http://localhost:8080
OPENAI_IMAGE_MODEL=gpt-image-2
OPENAI_IMAGE_SIZE=1024x1024
OPENAI_IMAGE_QUALITY=low
```

Useful options:

- `OPENAI_IMAGE_MODEL`: defaults to `gpt-image-2`
- `OPENAI_IMAGE_SIZE`: defaults to `1024x1024`
- `OPENAI_IMAGE_QUALITY`: `low`, `medium`, or `high`

## Notes For Distribution

To create a clean ZIP for sharing:

```bash
npm run package
```

Send:

```text
release/ShoeImagineP-local.zip
```

Do not distribute a real `server/.env` file with an API key inside it. Send `server/.env.example` and let the museum paste their own key into `server/.env`.

The in-app API key field also writes to `server/.env`. It is intended for local museum computers only; the server listens on `127.0.0.1` by default.

Generated local gallery data is intentionally stored outside source control:

- `server/data`
- `server/dalleImages`
