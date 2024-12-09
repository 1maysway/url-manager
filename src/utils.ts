import { RouteConfig } from './types';

export function hasDuplicateRoutes(config: RouteConfig): boolean {
  function checkBranch(
    currentConfig: RouteConfig,
    seenRoutes: Set<string> = new Set()
  ): boolean {
    if (currentConfig.branches) {
      const branchSeenRoutes = new Set<string>();
      for (const branch of currentConfig.branches) {
        if (branchSeenRoutes.has(branch.route)) {
          return true;
        }
        branchSeenRoutes.add(branch.route);
        if (checkBranch(branch)) {
          return true;
        }
      }
    }
    return false;
  }
  return checkBranch(config);
}

export function validateRoute(route: string, config: RouteConfig): boolean {
  const routeParts = route.split('/').filter(Boolean);

  function matchRoute(parts: string[], currentConfig: RouteConfig): boolean {
    if (parts.length === 0) {
      return true;
    }

    const [currentPart, ...remainingParts] = parts;
    const configRoute = currentConfig.route;

    // Handle empty root route
    if (configRoute === '' && currentConfig.branches) {
      return currentConfig.branches.some((branch) => matchRoute(parts, branch));
    }

    // Check if current part matches config route or is a parameter
    const isMatch =
      currentPart === configRoute ||
      (configRoute.startsWith('{') && configRoute.endsWith('}'));

    if (!isMatch) {
      return false;
    }

    // If we have more parts to match but no branches, invalid
    if (remainingParts.length > 0 && !currentConfig.branches) {
      return false;
    }

    // If we've matched all parts, valid
    if (remainingParts.length === 0) {
      return true;
    }

    // Try to match remaining parts against branches
    return (
      currentConfig.branches?.some((branch) =>
        matchRoute(remainingParts, branch)
      ) ?? false
    );
  }

  return matchRoute(routeParts, config);
}

export function extractParamsFromPath(
  templateRoute: string,
  actualPath: string
): Record<string, string> {
  const templateParts = templateRoute.split('/').filter(Boolean);
  const pathParts = actualPath.split('/').filter(Boolean);
  const params: Record<string, string> = {};

  templateParts.forEach((part, index) => {
    if (part.startsWith('{') && part.endsWith('}')) {
      const paramName = part.slice(1, -1);
      params[paramName] = pathParts[index] || '';
    }
  });

  return params;
}

export function extractRequiredParams(route: string): string[] {
  return route
    .split('/')
    .filter(Boolean)
    .filter((part) => part.startsWith('{') && part.endsWith('}'))
    .map((part) => part.slice(1, -1));
}
