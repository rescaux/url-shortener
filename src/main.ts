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
import env from './env';
import {createLogger, format, Logger, transports} from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';

const logFormat = format.combine(
  format.colorize(),
  format.printf(info => `[${info.timestamp} ${info.level}] ${info.message}`)
);

// initialize logger
export const log: Logger = createLogger({
  level: env.LOG_LEVEL,
  exitOnError: env.LOG_EXIT_ON_ERROR,
  format: format.timestamp({format: env.TIME_FORMAT}),
  silent: env.LOG_OUTPUT_DISABLE,
  transports: new transports.Console({format: logFormat}),
});

if (!env.LOG_FILE_DISABLE) {
  log.add(
    new DailyRotateFile({
      json: env.LOG_FILE_JSON,
      format: format.combine(env.LOG_FILE_JSON ? format.json() : logFormat),
      datePattern: env.DATE_FORMA,
      dirname: env.LOG_FILE_PATH,
      maxSize: env.LOG_FILE_MAX_SIZE,
      maxFiles: env.LOG_FILE_DELETE_TRESHOLD,
      frequency: env.LOG_FILE_ROTATION,
      filename: '%DATE%.log',
      symlinkName: 'latest.log',
      createSymlink: true,
      zippedArchive: true,
    })
  );
}
