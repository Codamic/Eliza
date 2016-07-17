## A web user interface for Marathon

A web interface for Marathon

### Prerequisites

##### 1. Install all dependencies

        npm install
        npm install -g gulp

##### 2. Override development configuration

    1. Copy `src/js/config/config.template.js` to `src/js/config/config.dev.js`
    2. Override variables in `config.dev.js` to reflect your local development
    configuration

##### 3. Run development environment

  ```
  docker-compose up

  npm run serve

  # or

  npm run livereload
  ```

 for a `browsersync` live-reload server.
