import {
  RouteConfig,
  ValidRoutes,
  RouteParams,
  URLManagerOptions,
} from './types';
import {
  validateRoute,
  extractParamsFromPath,
  extractRequiredParams,
  hasDuplicateRoutes,
} from './utils';

export function createURLManager<T extends RouteConfig>(config: T) {
  if (hasDuplicateRoutes(config)) {
    throw new Error('Config contains duplicate routes in the same branch');
  }

  return function buildURL<Route extends ValidRoutes<T>>(
    route: Route,
    params?: Partial<RouteParams<Route>>,
    options?: URLManagerOptions
  ): string {
    if (!validateRoute(route, config)) {
      throw new Error(`Invalid route: ${route}`);
    }

    const currentPath =
      options?.currentPath ||
      (typeof window !== 'undefined' ? window.location.pathname : '');
    const existingParams = extractParamsFromPath(route, currentPath);
    const requiredParams = extractRequiredParams(route);

    let finalUrl = route as string;
    for (const paramName of requiredParams) {
      const paramValue =
        params?.[paramName as keyof typeof params] || existingParams[paramName];

      if (!paramValue) {
        throw new Error(`Missing required parameter: ${paramName}`);
      }

      finalUrl = finalUrl.replace(`{${paramName}}`, paramValue);
    }

    return '/' + finalUrl.replace(/^\/+|\/+$/g, '');
  };
}

export type { RouteConfig, ValidRoutes, RouteParams, URLManagerOptions };