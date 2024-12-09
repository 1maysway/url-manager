export type RouteConfig = {
  route: string;
  branches?: RouteConfig[];
};

// Helper type to extract path parameters from a route string
type ExtractRouteParams<T extends string> = 
  T extends `${infer Start}{${infer Param}}${infer Rest}`
    ? Param | ExtractRouteParams<Rest>
    : never;

// Helper type to build valid route paths recursively
type BuildRoutePaths<T extends RouteConfig> = 
  T extends { route: infer R extends string, branches: (infer B extends RouteConfig)[] }
    ? R extends ''
      ? BuildRoutePaths<B>
      : R | `${R}/${BuildRoutePaths<B>}`
    : T['route'];

// Get all valid routes from config
export type ValidRoutes<T extends RouteConfig> = BuildRoutePaths<T>;

// Extract params from a specific route
export type RouteParams<Route extends string> = {
  [K in ExtractRouteParams<Route>]: string;
};

export type URLManagerOptions = {
  currentPath?: string;
};