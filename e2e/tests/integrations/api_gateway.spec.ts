import { test, expect } from '@playwright/test';
import apiGatewayFixture from '../../fixtures/api_gateway.json';

/**
 * E2E tests for API Gateway service
 * Tests: services/system-integration/microservices/api-gateway/
 *   - routes/routes.go
 *   - handlers/proxy.go
 *   - handlers/navigation.go
 */

test.describe('API Gateway', () => {
  test.describe('Health Endpoints', () => {
    test('should return healthy status from /health endpoint', async ({ request }) => {
      const response = await request.get('/health');
      expect(response.ok()).toBeTruthy();

      const body = await response.json();
      expect(body.status).toBe('healthy');
      expect(body.service).toBe('api-gateway');
    });

    test('should return ready status from /health/ready endpoint', async ({ request }) => {
      const response = await request.get('/health/ready');
      expect(response.ok()).toBeTruthy();

      const body = await response.json();
      expect(body.status).toBe('ready');
    });

    test('should return alive status from /health/live endpoint', async ({ request }) => {
      const response = await request.get('/health/live');
      expect(response.ok()).toBeTruthy();

      const body = await response.json();
      expect(body.status).toBe('alive');
    });

    test('should return system status with all endpoints configured', async ({ request }) => {
      const response = await request.get('/api/v1/system/status');
      expect(response.ok()).toBeTruthy();

      const body = await response.json();
      expect(body.endpoints).toBeDefined();
      expect(body.endpoints.project_management).toBe('configured');
      expect(body.endpoints.goal_management).toBe('configured');
      expect(body.endpoints.hr_management).toBe('configured');
      expect(body.endpoints.engineering_analytics).toBe('configured');
      expect(body.endpoints.workforce_wellbeing).toBe('configured');
    });
  });

  test.describe('Route Proxying', () => {
    test('should proxy requests to project management service', async ({ request }) => {
      const response = await request.get('/api/v1/projects/sprints');
      // Accept either success or service unavailable (if backend is not running)
      expect([200, 502, 503]).toContain(response.status());
    });

    test('should proxy requests to goal management service', async ({ request }) => {
      const response = await request.get('/api/v1/goals/objectives');
      expect([200, 502, 503]).toContain(response.status());
    });

    test('should proxy requests to hr management service', async ({ request }) => {
      const response = await request.get('/api/v1/hr/employees');
      expect([200, 502, 503]).toContain(response.status());
    });

    test('should proxy requests to engineering analytics service', async ({ request }) => {
      const response = await request.get('/api/v1/analytics/metrics');
      expect([200, 502, 503]).toContain(response.status());
    });

    test('should proxy requests to workforce wellbeing service', async ({ request }) => {
      const response = await request.get('/api/v1/wellbeing/indicators');
      expect([200, 502, 503]).toContain(response.status());
    });
  });

  test.describe('Error Handling', () => {
    test('should return 404 for unknown routes', async ({ request }) => {
      const response = await request.get('/api/v1/unknown/route');
      expect(response.status()).toBe(404);

      const body = await response.json();
      expect(body.error).toBe('Not Found');
    });

    test('should return appropriate error for method not allowed', async ({ request }) => {
      const response = await request.delete('/health');
      expect([404, 405]).toContain(response.status());
    });
  });

  test.describe('Gateway Headers', () => {
    test('should add X-Gateway header to responses', async ({ request }) => {
      const response = await request.get('/health');
      expect(response.ok()).toBeTruthy();

      const headers = response.headers();
      expect(headers['x-gateway']).toBe('ugjb-api-gateway');
    });
  });
});
