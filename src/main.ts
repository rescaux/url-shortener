/*
 * This file is licensed under The MIT License
 * Copyright 2020 Riegler Daniel
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
import {config} from 'dotenv';
import {Logger, createLogger, transports, format} from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';
import {toBoolean} from './util/StringUtil';
import {AssertionError} from 'assert';

// initialize config from .env
config();

const logFormat = format.combine(
  format.colorize(),
  format.printf(
    info => `[${info.timestamp} ${info.level}] ${JSON.stringify(info.message)}`
  )
);

// initialize logger
export const log: Logger = createLogger({
  level: process.env.LOG_LEVEL,
  exitOnError: Boolean(process.env.LOG_EXIT_ON_ERROR),
  format: format.timestamp({format: process.env.TIME_FORMAT}),
  silent: toBoolean(process.env.LOG_OUTPUT_DISABLE),
  transports: new transports.Console({format: logFormat}),
});

if (!toBoolean(process.env.LOG_FILE_DISABLE)) {
  const useJson: boolean = toBoolean(process.env.LOG_FILE_JSON);
  log.add(
    new DailyRotateFile({
      json: useJson,
      format: format.combine(useJson ? format.json() : logFormat),
      datePattern: process.env.DATE_FORMA,
      dirname: process.env.LOG_FILE_PATH,
      maxSize: process.env.LOG_FILE_MAX_SIZE,
      maxFiles: process.env.LOG_FILE_DELETE_TRESHOLD,
      frequency: process.env.LOG_FILE_ROTATION,
      filename: '%DATE%.log',
      symlinkName: 'latest.log',
      createSymlink: true,
      zippedArchive: true,
    })
  );
}

log.info('This is a test');
//log.error('An error occurred', new Error('Das ist ein Error'));
