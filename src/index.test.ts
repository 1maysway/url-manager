import { expect, test, describe } from 'vitest';
import { createURLManager, RouteConfig } from './index';

const config = {
  route: '',
  branches: [
    {
      route: 'workspaces',
      branches: [
        {
          route: '{workspaceId}',
          branches: [
            {
              route: 'projects',
              branches: [
                {
                  route: '{projectId}',
                },
              ],
            },
          ],
        },
      ],
    },
  ],
} as const satisfies RouteConfig;

const invalidConfig = {
  route: '',
  branches: [
    {
      route: 'workspaces',
      branches: [
        { route: 'test' },
        { route: 'test' }, // Duplicate route
      ],
    },
  ],
} as const satisfies RouteConfig;

describe('URL Manager', () => {
  test('creates valid URL with just route', () => {
    const urlManager = createURLManager(config);
    const url = urlManager('workspaces', {});
    expect(url).toBe('/workspaces');
  });

  test('creates valid URL with route and params', () => {
    const urlManager = createURLManager(config);
    const url = urlManager('workspaces/{workspaceId}', { workspaceId: '123' });
    expect(url).toBe('/workspaces/123');
  });

  test('creates valid nested URL with multiple params', () => {
    const urlManager = createURLManager(config);
    const url = urlManager('workspaces/{workspaceId}/projects/{projectId}', {
      workspaceId: '123',
      projectId: '456',
    });
    expect(url).toBe('/workspaces/123/projects/456');
  });

  test('uses current path params if available', () => {
    const urlManager = createURLManager(config);
    const url = urlManager(
      'workspaces/{workspaceId}/projects/{projectId}',
      { projectId: '456' },
      { currentPath: '/workspaces/123/projects/789' }
    );
    expect(url).toBe('/workspaces/123/projects/456');
  });

  test('throws error on invalid route', () => {
    const urlManager = createURLManager(config);
    // @ts-expect-error - Testing runtime check for invalid route
    expect(() => urlManager('invalid/route')).toThrow(
      'Invalid route: invalid/route'
    );
  });

  test('throws error on missing required param', () => {
    const urlManager = createURLManager(config);
    expect(() => urlManager('workspaces/{workspaceId}')).toThrow(
      'Missing required parameter: workspaceId'
    );
  });

  test('throws error on duplicate routes in config', () => {
    expect(() => createURLManager(invalidConfig)).toThrow(
      'Config contains duplicate routes in the same branch'
    );
  });
});