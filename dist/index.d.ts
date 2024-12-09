import { RouteConfig, ValidRoutes, RouteParams, URLManagerOptions } from './types';
export declare function createURLManager<T extends RouteConfig>(config: T): <Route extends ValidRoutes<T>>(route: Route, params?: Partial<RouteParams<Route>>, options?: URLManagerOptions) => string;
export type { RouteConfig, ValidRoutes, RouteParams, URLManagerOptions };
