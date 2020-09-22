/*
 *     ________________ __
 *    / ____/ ___/ ___// /____  __  _______
 *   / __/  \__ \\__ \/ __/ _ \/ / / / ___/
 *  / /___ ___/ /__/ / /_/  __/ /_/ / /
 * /_____//____/____/\__/\___/\__, /_/
 *                           /____/
 *
 * This file is ported from https://git.io/JUzDD
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
import {NextFunction, Request, Response, Router} from 'express';
import session, {SessionOptions} from 'express-session';
import ExpressFormidable from 'express-formidable';
import AdminBro from 'admin-bro';
import {resolve} from 'path';

/**
 * Builds the Express Router that handles all the pages and assets
 *
 * @param  {AdminBro} admin                       instance of AdminBro
 * @param router
 * @param  {ExpressFormidableOptions} [formidableOptions]    Express.js router
 * @return {express.Router}                       Express.js router
 * @function
 * @static
 * @memberof module:@admin-bro/express
 */
export const buildRouter = (
  admin: AdminBro,
  router: Router = Router(),
  formidableOptions: {}
) => {
  admin.initialize().then(() => console.log('AdminBro: bundle ready'));

  const {routes, assets} = AdminBro.Router;

  router.use(ExpressFormidable(formidableOptions));

  routes.forEach(route => {
    // we have to change routes defined in AdminBro from {recordId} to :recordId
    const expressPath = route.path.replace(/{/g, ':').replace(/}/g, '');
    /**
     * @type {express.Handler}
     */
    const handler = async (
      request: Request,
      response: Response,
      next: NextFunction
    ) => {
      try {
        const controller = new route.Controller(
          {admin},
          request.session && request.session.adminUser
        );
        const {params, query} = request;
        const method = request.method.toLowerCase();
        const payload = {
          ...(request.fields || {}),
          ...(request.files || {}),
        };
        const html = await controller[route.action](
          {
            ...request,
            params,
            query,
            payload,
            method,
          },
          response
        );
        if (route.contentType)
          response.set({'Content-Type': route.contentType});
        if (html) response.send(html);
      } catch (error) {
        next(error);
      }
    };

    switch (route.method) {
      case 'GET': {
        router.get(expressPath, handler);
        break;
      }
      case 'POST': {
        router.post(expressPath, handler);
        break;
      }
    }
  });

  assets.forEach(asset =>
    router.get(asset.path, async (_request: Request, response: Response) =>
      response.sendFile(resolve(asset.src))
    )
  );

  return router;
};

/**
 * @typedef {Function} Authenticate
 * @memberof module:@admin-bro/express
 * @description
 * function taking 2 arguments email and password
 * @param {string} [email]         email given in the form
 * @param {string} [password]      password given in the form
 * @return {CurrentAdmin | null}      returns current admin or null
 */

/**
 * Builds the Express Router which is protected by a session auth
 *
 * Using the router requires you to install `express-session` as a
 * dependency. Normally express-session holds session in memory, which is
 * not optimized for production usage and, in development, it causes
 * logging out after every page refresh (if you use nodemon).
 *
 * @param  {AdminBro} admin                    instance of AdminBro
 * @param  {Object} auth                          authentication options
 * @param  {module:@admin-bro/express.Authenticate} auth.authenticate       authenticate function
 * @param  {String} auth.cookiePassword           secret used to encrypt cookies
 * @param  {String} auth.cookieName=adminbro      cookie name
 * @param router
 * @param  {SessionOptions} [sessionOptions]     Options that are passed to [express-session](https://github.com/expressjs/session)
 * @param  {ExpressFormidableOptions} [formidableOptions]     Options that are passed to [express-session](https://github.com/expressjs/session)
 * @return {express.Router}                       Express.js router
 * @static
 * @memberof module:@admin-bro/express
 * @example
 * const ADMIN = {
 *   email: 'test@example.com',
 *   password: 'password',
 * }
 *
 * AdminBroExpress.buildAuthenticatedRouter(adminBro, {
 *   authenticate: async (email, password) => {
 *     if (ADMIN.password === password && ADMIN.email === email) {
 *       return ADMIN
 *     }
 *     return null
 *   },
 *   cookieName: 'adminbro',
 *   cookiePassword: 'somePassword',
 * }, [router])
 */
export const buildAuthenticatedRouter = (
  admin: AdminBro,
  auth: any,
  router: Router,
  sessionOptions: SessionOptions,
  formidableOptions: {}
) => {
  router.use(
    session({
      ...sessionOptions,
      secret: auth.cookiePassword,
      name: auth.cookieName || 'adminbro',
    })
  );

  router.use(ExpressFormidable(formidableOptions));

  const {rootPath} = admin.options;
  let {loginPath, logoutPath} = admin.options;
  loginPath = loginPath.replace(rootPath, '');
  logoutPath = logoutPath.replace(rootPath, '');

  router.get(loginPath, async (request: Request, response: Response) => {
    const login = await admin.renderLogin({
      action: admin.options.loginPath,
      errorMessage: null,
    });
    response.send(login);
  });

  router.post(
    loginPath,
    async (request: Request, response: Response, next: NextFunction) => {
      if (!request.session || !request.fields) {
        next(new Error('Invalid session.'));
        return;
      }
      const {email, password} = request.fields;
      const adminUser = await auth.authenticate(email, password);
      if (adminUser) {
        request.session.adminUser = adminUser;
        request.session.save(error => {
          if (error) next(error);
          else response.redirect(request.session?.redirectTo || rootPath);
        });
      } else
        response.send(
          await admin.renderLogin({
            action: admin.options.loginPath,
            errorMessage: 'invalidCredentials',
          })
        );
    }
  );

  router.use((request: Request, response: Response, next: NextFunction) => {
    if (!request.session) {
      next(new Error('Invalid session.'));
      return;
    }
    if (
      AdminBro.Router.assets.find(asset =>
        request.originalUrl.match(asset.path)
      )
    )
      next();
    else if (request.session.adminUser) next();
    else {
      // If the redirection is caused by API call to some action just redirect to resource
      const [redirectTo] = request.originalUrl.split('/actions');
      request.session.redirectTo = redirectTo.includes(`${rootPath}/api`)
        ? rootPath
        : redirectTo;
      request.session.save(error => {
        if (error) next(error);
        else response.redirect(admin.options.loginPath);
      });
    }
  });

  router.get(logoutPath, async (request: Request, response: Response) => {
    if (!request.session) response.redirect(admin.options.loginPath);
    else
      request.session?.destroy(() =>
        response.redirect(admin.options.loginPath)
      );
  });

  return buildRouter(admin, router, formidableOptions);
};
