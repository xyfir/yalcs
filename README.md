# Yalcs — Yet Another Live Chat for Slack

Message your website's visitors through Slack for support or sales. 100% free and open source.

## Features

- Communicate with visitors who are on your site or app through your Slack workspace
- Standalone server and web client
  - Easy integration into new and existing applications of any stack
  - Self-hosted, with no third-party service subscriptions you have to pay for
- No dependencies other than Node and what npm will install
  - Older Node versions not actively supported
- Easy theming via [Material-UI](https://material-ui.com/style/color/#color-tool)

## Install

As simple as Yalcs is, because it's entirely self-hosted, you'll still need to download, configure, build, and integrate it into your app. We've made it just about as easy as it could possibly be.

**Note #1:** If your system does not yet have Node installed, start with [nvm](https://github.com/creationix/nvm#install-script) (or [nvm for Windows](https://github.com/coreybutler/nvm-windows#node-version-manager-nvm-for-windows)).

**Note #2:** You may alternatively download Yalcs through npm (see [here](http://npmjs.com/package/yalcs)), however this is not currently the recommended installation method. In the future we may offer a CLI tool available through npm to make configuring, running, and managing Yalcs instances easier.

## Step 0: Clone the repo

```bash
git clone https://github.com/Xyfir/yalcs.git
cd yalcs
```

From now on we'll assume commands are run from `yalcs/`.

## Step 1: Download npm dependencies

Install npm depencies for each module:

```bash
cd loader
npm install
cd ../server
npm install
cd ../web
npm install
cd ../ # back to yalcs/
```

## Step 2: Create Slack app and bot

1. Go to the [Slack API dashboard](https://api.slack.com/apps?new_app=1).
2. Login to the Slack workspace you wish to add Yalcs to.
3. Set the app name to Yalcs or whatever you like and select your workspace.
4. Once viewing your new Slack app, click _Bot Users_, then _Add a bot user_.
5. Set the name to Yalcs or whatever you'd like and enable its always online status.
6. Click _Add Bot User_.
7. Click _OAuth & Permissions_.
8. Click _Install App_ and authorize its installation to your workspace.
9. Once again in _OAuth & Permissions_, save your _Bot User OAuth Access Token_ somewhere for later use.
10. Click _Basic Information_.
11. Under _App Credentials_, save your _Signing Secret_ somewhere for later use.
12. In a new tab, navigate to your workspace: `your-workspace.slack.com`.
13. View the channel or private group you wish to add Yalcs to.
14. Save the channel's id from the url somewhere for later use. (For example, in `https://your-workspace.slack.com/messages/GHG8G3WH2/`, the id is `GHG8G3WH2`)

Keep the Slack API dashboard open, we'll return to it again later.

## Step 3: Set environment variables

The Yalcs modules are configured via environment variables which are loaded into the applications via `.env` files located in each module's directory.

To understand the syntax of the `.env` files, know that they are first loaded via [dotenv](https://www.npmjs.com/package/dotenv) and then the string values provided by dotenv are parsed by [enve](https://www.npmjs.com/package/dotenv).

### Step 3a: Create `.env` files

First we'll create each file by copying the example `.env` files and then we'll work our way through populating them with values.

```bash
cp loader/example.env loader/.env
cp server/example.env server/.env
cp web/example.env web/.env
```

### Step 3b: Edit `.env` files

Edit the files `loader/.env`, `server/.env`, and `web/.env`. Update the config keys with your own values. You can find descriptions for each one under the `Yalcs` -> `Env` namespaces in the [type definitions](https://github.com/Xyfir/yalcs/blob/master/types/yalcs.d.ts). Use the appropriate `interface` for each corresponding file.

## Step 4: Build from source

```bash
cd loader
npm run build
cd ../server
npm run build
cd ../web
npm run build
cd ../
```

## Step 5: Start the server

Now you'll need to start the server and serve the built files. The simplest way to do this is:

```bash
cd server
npm run start
cd ../
```

If you're in production, you'll probably run the server with [pm2](https://www.npmjs.com/package/pm2) and proxy the server through Nginx or Apache while serving static files through them instead of Node. For you, know that files to be served to the client are located in `web/dist` with `web/dist/index.html` serving as the web client's entry file.

## Step 6: Configure Slack event listener

Let's return to the Slack API dashboard again.

1. Go to _Event Subscriptions_ and toggle _Enable Events_.
2. For the _Request URL_ field, input the full URL to your instance of Yalcs server (the API), and then append to that URL `/slack`. It will should look something like this: `https://example.com/yalcs/api/slack`. It should verify.
3. Under _Subscribe to Bot Events_, add `message.channels` if you're adding Yalcs to a public channel or `message.groups` if you're adding Yalcs to a private channel/group.

## Step 7: Add Yalcs to your app

Now all that's left is to add the Yalcs loader to one of your page's HTML. Wherever you'd like it to run, add the following to the bottom of `<body>`:

```html
<script src="/yalcs/static/yalcs-loader.js"></script>
```

Note that the source is fully dependent on where your app is serving the Yalcs web client files from and the URL of the page(s) where you're importing the loader. It should generally be a URL that combines `YALCS_WEB_URL` with `STATIC_PATH` and `"yalcs-loader.js"`.

## Contribute

If you'd like to help work on Yalcs, the tutorial above will suffice to get you up and running. Certain things however will make your life easier:

- Make sure your `NODE_ENV` variables in the `.env` files are set to `"development"`.
- Run the web client's dev server via `npm run start` when in `web/`. Connect to it via the `PORT` you set in `web/.env`.
- Use [ngrok](https://ngrok.com) so that Slack can contact your local machine: `ngrok http 2040` where `2040` is the API server's port.
- Use `http://localhost:2041/loader.html` to properly test the web app and loader. This assumes you're running the web client's dev server on port `2041`.
- Check the `scripts` in each module's `package.json` for helpful scripts.
