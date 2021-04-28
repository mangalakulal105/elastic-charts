/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

const getConfig = require('jest-puppeteer-docker/lib/config');

const { debug, port, isLocalVRTServer, isLegacyVRTServer } = require('./config');

const baseConfig = debug ? {} : getConfig();

const defaultViewport = {
  width: 800,
  height: 600,
};
const sharedConfig = {
  defaultViewport,
  ignoreHTTPSErrors: true,
};

/**
 * combined config object
 *
 * https://github.com/smooth-code/jest-puppeteer/tree/master/packages/jest-environment-puppeteer#jest-puppeteerconfigjs
 */
const customConfig = {
  ...(debug
    ? {
        launch: {
          args: ['--no-sandbox'], // required to connect puppeteer to chromium devtools ws
          dumpio: false,
          headless: false,
          slowMo: 500,
          devtools: true,
          ...sharedConfig,
        },
      }
    : {
        // https://github.com/gidztech/jest-puppeteer-docker/issues/24
        chromiumFlags: [], // for docker chromium options
        connect: {
          ...sharedConfig,
        },
      }),
  server: isLocalVRTServer
    ? null
    : {
        command: isLegacyVRTServer
          ? `yarn start --port=${port} --quiet`
          : `yarn test:integration:server --port=${port}`,
        port,
        usedPortAction: 'error',
        launchTimeout: 120000,
        ...(!isLegacyVRTServer && {
          waitOnScheme: {
            // using localhost as the server is running on the local machine
            resources: [`http://localhost:${port}`],
            delay: 1000,
            interval: 100,
          },
        }),
        debug: true,
      },
  ...baseConfig,
};

module.exports = customConfig;
