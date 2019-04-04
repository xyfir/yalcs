# YALCS — Yet Another Live Chat for Slack

Message your website's visitors through Slack for support or sales. 100% free and open source.

## Features

- Communicate with visitors on your site or app through your Slack workspace
- Standalone server and web client
  - Easy integration into new and existing applications of any stack
  - Self-hosted, with no third-party service subscriptions you have to pay for
- No dependencies other than Node and what npm will install
  - Older Node versions not actively supported
- Easy theming via [Material-UI](https://material-ui.com/style/color/#color-tool)

## Install

As simple as YALCS is, you'll still need to download, configure, build, and integrate into your app. We've made it just about as easy as it could possibly be.

**Note #1:** If your system does not yet have Node installed, start with [nvm](https://github.com/creationix/nvm#install-script) (or [nvm for Windows](https://github.com/coreybutler/nvm-windows#node-version-manager-nvm-for-windows)).

**Note #2:** You may alternatively download YALCS through npm (see [here](http://npmjs.com/package/yalcs)), however this is not currently the recommended installation method. In the future we may have a CLI tool available through npm to make configuring, running, and managing YALCS instances easier.

### Step n: Create Slack App and Bot

It's easier than it sounds. Go [here](https://api.slack.com/apps?new_app=1). You'll need to be logged into the Slack workspace you wish to add YALCS to.

Set the app name to YALCS and choose your workspace in the list below.

Under _Add features and functionality_ click _Bots_, then _Add a bot user_.

Set the name to YALCS again and enable the always online status. Click _Add Bot User_.

Go to _Event Subscriptions_ and toggle _Enable Events_.

## Server

```bash
git clone https://github.com/Xyfir/yalcs.git
cd yalcs/server
npm install
touch .env
```

Now open up `yalcs/server/.env` in your editor and fill out the values. See the `YALCS.Env.Common` and `YALCS.Env.Server` interfaces in [types/yalcs.d.ts](https://github.com/Xyfir/yalcs/blob/master/types/yalcs.d.ts) for expected environment variables. Format is `KEY=VALUE` (`PORT=1234`, `NAME="My App"`, etc).

```bash
npm run build
npm run start # or launch ./dist/app.js however you like
```

At this point the setup is based on your environment and what your needs are. Probably you'll run the server with [pm2](https://www.npmjs.com/package/pm2) and put Node behind Nginx or Apache.

## Web Client

```bash
cd ../web
npm install
touch .env
```

Now open up `yalcs/web/.env` in your editor and fill out the values. See the `YALCS.Env.Common` and `YALCS.Env.Web` interfaces in [types/yalcs.d.ts](https://github.com/Xyfir/yalcs/blob/master/types/yalcs.d.ts) for expected environment variables.

```bash
npm run build
```

## Integration Into Your App

This part is largely up to you,
