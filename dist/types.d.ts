export type RouteConfig = {
    route: string;
    branches?: RouteConfig[];
};
type ExtractRouteParams<T extends string> = T extends `${infer Start}{${infer Param}}${infer Rest}` ? Param | ExtractRouteParams<Rest> : never;
type BuildRoutePaths<T extends RouteConfig> = T extends {
    route: infer R extends string;
    branches: (infer B extends RouteConfig)[];
} ? R extends '' ? BuildRoutePaths<B> : R | `${R}/${BuildRoutePaths<B>}` : T['route'];
export type ValidRoutes<T extends RouteConfig> = BuildRoutePaths<T>;
export type RouteParams<Route extends string> = {
    [K in ExtractRouteParams<Route>]: string;
};
export type URLManagerOptions = {
    currentPath?: string;
};
export {};
