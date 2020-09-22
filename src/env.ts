/*
 *     ________________ __
 *    / ____/ ___/ ___// /____  __  _______
 *   / __/  \__ \\__ \/ __/ _ \/ / / / ___/
 *  / /___ ___/ /__/ / /_/  __/ /_/ / /
 * /_____//____/____/\__/\___/\__, /_/
 *                           /____/
 *
 * This file is licensed under The MIT License
 * Copyright (c) 2020 Riegler Daniel
 * Copyright (c) 2020 ESS Engineering Software Steyr GmbH
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
import {bool, cleanEnv, host, port, str, url} from 'envalid';

export default cleanEnv(process.env, {
  DATE_FORMAT: str({
    default: 'DD-MM-YYYY',
    desc: 'Format used to show dates',
    docs: 'https://en.wikipedia.org/wiki/ISO_8601',
  }),
  TIME_FORMAT: str({
    default: 'HH:mm:ss',
    devDefault: 'HH:mm:ss.SSS',
    desc: 'Format used to show timestamps',
    docs: 'https://en.wikipedia.org/wiki/ISO_8601',
  }),
  WEB_HOSTNAME: host({
    default: 'localhost',
    desc: 'Hostname for the webserver to listen on',
  }),
  WEB_PORT: port({
    default: 1312,
    desc: 'Port for the webserver to listen on',
  }),
  AP_PATH: str({
    default: '/admin',
    desc: 'Path on which the admin panel is exposed',
  }),
  AP_LOGO: url({
    default: 'https://abload.de/img/191114_med_ess_cube_c41kq9.png',
    desc: 'Branding logo to show on the admin panel',
  }),
  AP_NAME: str({
    default: 'url-shortener',
    desc: 'Branding name to show on the admin panel (title)',
  }),
  SESSION_NAME: str({
    default: 'usession',
    desc: 'Name of the HTTP(S) session',
  }),
  SESSION_SECRET: str({
    devDefault: 'ChangeToASafeSecret',
    example: '~8\\3**6yD#=SgEB@iB5-b#n#He~',
    desc: 'Random session cookie secret key',
  }),
  SESSION_COOKIE_DOMAIN: host({
    devDefault: 'localhost',
    example: 'go.essteyr.com',
    desc: 'Session cookie domain (should be same as the app.)',
  }),
  SESSION_COOKIE_SECURE: bool({
    default: false,
    desc:
      'Encrypt session cookie (only enable if app. too is running an encrypted connection (SSL cert.))',
  }),
  LOG_LEVEL: str({
    default: 'warning',
    devDefault: 'debug',
    choices: [
      'emerg',
      'alert',
      'crit',
      'error',
      'warning',
      'notice',
      'info',
      'debug',
    ],
    desc: 'Severity level of command-line log output',
    docs: 'https://github.com/winstonjs/winston#logging-levels',
  }),
  LOG_OUTPUT_DISABLE: bool({
    default: false,
    desc: 'Disables command-line log output',
  }),
  LOG_EXIT_ON_ERROR: bool({
    default: true,
    devDefault: false,
    desc: 'Shuts down the software if an error was thrown',
  }),
  LOG_FILE_DISABLE: bool({
    default: false,
    desc: 'Disables storage of logs on the filesystem',
  }),
  LOG_FILE_JSON: bool({
    default: true,
    desc: 'Logs to files in json format',
  }),
  LOG_FILE_PATH: str({
    default: 'logs/',
    desc: 'Relative path of where to store log files',
  }),
  LOG_FILE_MAX_SIZE: str({
    default: '20m',
    desc: 'Max. size of a single log file before a new one is created',
    docs: 'https://www.npmjs.com/package/winston-daily-rotate-file',
  }),
  LOG_FILE_ROTATION: str({
    default: '24h',
    desc: 'Max. time allowed to pass by before a new log file is created',
    docs: 'https://www.npmjs.com/package/winston-daily-rotate-file',
  }),
  LOG_FILE_DELETE_THRESHOLD: str({
    default: '7d',
    desc:
      'Max. time allowed to pass by after which old log files get removed from the filesystem',
  }),
});
