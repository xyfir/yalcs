export namespace Yalcs {
  export interface Message {
    ts: string;
    text: string;
    outgoing?: boolean;
  }

  export interface MessageInThread {
    thread_ts: string;
    message: Yalcs.Message;
  }

  export interface Thread {
    thread_ts?: string;
    messages?: Yalcs.Message[];
  }

  export interface EventData {
    yalcs: true;
    show: boolean;
  }

  export namespace Env {
    export interface Server {
      /**
       * Port the API will be hosted on
       */
      PORT: number;
      /**
       * Is this a production environment?
       */
      NODE_ENV: 'development' | 'production';
      /**
       * Base path (for URL) of static files
       * @example "/static/"
       */
      STATIC_PATH: string;
      /**
       * Absolute path for yalcs-web.
       * @example "/path/to/yalcs/web"
       */
      WEB_DIRECTORY: string;
      /**
       * URL for the Yalcs embedded web client
       * @example "https://example.com/yalcs"
       */
      YALCS_WEB_URL: string;
      /**
       * The id of your Slack channel.
       * @example "C2147483705"
       */
      SLACK_CHANNEL: string;
      /**
       * "Bot User OAuth Access Token"
       * @example "xoxb-155555555555-600000000000-XXXXXXXXXXXXXXXXXXXXXXXX"
       */
      SLACK_BOT_TOKEN: string;
      /**
       * Secret Slack uses to sign requests to Yalcs.
       * @example "11b0904b7f4e261dfaca88de70a4935e"
       */
      SLACK_SIGNING_SECRET: string;
    }

    export interface Web {
      /**
       * Port for the Webpack dev server. Only needed for Yalcs developers
       */
      PORT: number;
      /**
       * Passed to Material-UI's `createMUITheme()`. Can be left an empty object
       * https://material-ui.com/style/color/#color-tool
       */
      THEME: any;
      /**
       * Floating Action Button text.
       * @example "Have a question?"
       */
      FAB_TEXT: string;
      /**
       * Is this a production environment?
       */
      NODE_ENV: 'development' | 'production';
      /**
       * Chat window title.
       * @example "Send us a message..."
       */
      TITLE_TEXT: string;
      /**
       * Base path (for URL) of static files
       * @example "/static/"
       */
      STATIC_PATH: string;
      /**
       * Should the floating action button be on the right side?
       */
      FAB_ON_RIGHT?: boolean;
      /**
       * URL for the Yalcs API (yalcs-server)
       * @example "https://example.com/api/yalcs"
       */
      YALCS_API_URL: string;
      /**
       * Placeholder text for the message input.
       * @example "Ask a question or give your feedback..."
       */
      MESSAGE_PLACEHOLDER_TEXT: string;
      /**
       * Floating Action Button text when unread messages are available.
       * @example "Check your messages"
       */
      UNREAD_MESSAGES_FAB_TEXT: string;
    }

    export interface Loader {
      /**
       * Is this a production environment?
       */
      NODE_ENV: 'development' | 'production';
      /**
       * Should the floating action button be on the right side?
       */
      FAB_ON_RIGHT?: boolean;
      /**
       * URL for the Yalcs embedded web client
       * @example "https://example.com/yalcs"
       */
      YALCS_WEB_URL: string;
    }
  }
}
