export namespace YALCS {
  export namespace Env {
    export interface Common {
      /**
       * Your application's name as you want it displayed to users
       */
      NAME: string;
      /**
       * Is this a production environment?
       */
      NODE_ENV: 'development' | 'production';
      /**
       * Base path (for URL) of static files
       * @example "/static/"
       */
      STATIC_PATH: string;
    }

    export interface Server extends YALCS.Env.Common {
      /**
       * Port the API will be hosted on
       */
      PORT: number;
      /**
       * Absolute path for yalcs-web.
       * @example "/path/to/yalcs/web"
       */
      WEB_DIRECTORY: string;
      /**
       * URL for YALCS's web client (where your users will access it)
       * @example "https://example.com/yalcs"
       */
      YALCS_WEB_URL: string;
    }

    export interface Web extends YALCS.Env.Common {
      /**
       * Port for the Webpack dev server. Only needed for YALCS developers
       */
      PORT: number;
      /**
       * Passed to Material-UI's `createMUITheme()`. Can be left an empty object
       * https://material-ui.com/style/color/#color-tool
       */
      THEME: object;
      /**
       * URL for YALCS's API (yalcs-server)
       * @example "https://example.com/api/yalcs"
       */
      YALCS_API_URL: string;
    }
  }
}
