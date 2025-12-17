import { test, expect } from '@playwright/test';
import metricsCollectorFixture from '../../../fixtures/engineering-analytics/metrics-collector/metrics_collector.json';

/**
 * E2E tests for Metrics Collector service
 * Tests: services/engineering-analytics/microservices/metrics-collector/
 *   - app/routers/activities.py
 *   - app/routers/metrics.py
 *   - app/routers/automation.py
 *   - app/routers/__init__.py
 *   - app/routers/webhooks.py
 *   - app/routers/integrations.py
 */

test.describe('Metrics Collector', () => {
  test.describe('Health Endpoints', () => {
    test('should return healthy status from /health endpoint', async ({ request }) => {
      const response = await request.get('/api/v1/analytics/health');
      expect(response.ok()).toBeTruthy();

      const body = await response.json();
      expect(body.status).toBe('healthy');
      expect(body.service).toBe('metrics-collector');
    });
  });

  test.describe('Activities', () => {
    test('should create an activity record', async ({ request }) => {
      const response = await request.post('/api/v1/analytics/activities', {
        data: {
          employee_id: 'emp-test-001',
          activity_type: 'commit',
          source: 'gitlab',
          metadata: {
            repository: 'test-repo',
            branch: 'main',
            message: 'Test commit'
          }
        }
      });
      expect(response.ok()).toBeTruthy();

      const body = await response.json();
      expect(body.employee_id).toBe('emp-test-001');
      expect(body.activity_type).toBe('commit');
      expect(body.id).toBeDefined();
    });

    test('should get activities for an employee', async ({ request }) => {
      const response = await request.get('/api/v1/analytics/employees/emp-001/activities');
      expect(response.ok()).toBeTruthy();

      const body = await response.json();
      expect(Array.isArray(body)).toBe(true);
    });

    test('should filter activities by type', async ({ request }) => {
      const response = await request.get('/api/v1/analytics/employees/emp-001/activities?activity_type=commit');
      expect(response.ok()).toBeTruthy();

      const body = await response.json();
      expect(Array.isArray(body)).toBe(true);
      body.forEach((activity: any) => {
        expect(activity.activity_type).toBe('commit');
      });
    });

    test('should filter activities by source', async ({ request }) => {
      const response = await request.get('/api/v1/analytics/employees/emp-001/activities?source=gitlab');
      expect(response.ok()).toBeTruthy();

      const body = await response.json();
      expect(Array.isArray(body)).toBe(true);
      body.forEach((activity: any) => {
        expect(activity.source).toBe('gitlab');
      });
    });
  });

  test.describe('Metrics', () => {
    test('should get DORA metrics', async ({ request }) => {
      const response = await request.get('/api/v1/analytics/metrics/dora');
      expect(response.ok()).toBeTruthy();

      const body = await response.json();
      expect(body).toBeDefined();
    });

    test('should get deployment frequency metric', async ({ request }) => {
      const response = await request.get('/api/v1/analytics/metrics/deployment-frequency');
      expect(response.ok()).toBeTruthy();

      const body = await response.json();
      expect(body.metric_type).toBe('deployment_frequency');
      expect(body.value).toBeDefined();
    });

    test('should get lead time metric', async ({ request }) => {
      const response = await request.get('/api/v1/analytics/metrics/lead-time');
      expect(response.ok()).toBeTruthy();

      const body = await response.json();
      expect(body.metric_type).toBe('lead_time');
      expect(body.value).toBeDefined();
    });

    test('should get change failure rate metric', async ({ request }) => {
      const response = await request.get('/api/v1/analytics/metrics/change-failure-rate');
      expect(response.ok()).toBeTruthy();

      const body = await response.json();
      expect(body.metric_type).toBe('change_failure_rate');
      expect(body.value).toBeDefined();
      expect(body.value).toBeGreaterThanOrEqual(0);
      expect(body.value).toBeLessThanOrEqual(1);
    });

    test('should get MTTR metric', async ({ request }) => {
      const response = await request.get('/api/v1/analytics/metrics/mttr');
      expect(response.ok()).toBeTruthy();

      const body = await response.json();
      expect(body.metric_type).toBe('mttr');
      expect(body.value).toBeDefined();
    });

    test('should get metrics with date range filter', async ({ request }) => {
      const response = await request.get('/api/v1/analytics/metrics?start_date=2024-01-01T00:00:00Z&end_date=2024-12-31T23:59:59Z');
      expect(response.ok()).toBeTruthy();

      const body = await response.json();
      expect(Array.isArray(body) || typeof body === 'object').toBe(true);
    });
  });

  test.describe('Automation Rules', () => {
    test('should get automation rules', async ({ request }) => {
      const response = await request.get('/api/v1/analytics/automation/rules');
      expect(response.ok()).toBeTruthy();

      const body = await response.json();
      expect(Array.isArray(body)).toBe(true);
    });

    test('should create an automation rule', async ({ request }) => {
      const response = await request.post('/api/v1/analytics/automation/rules', {
        data: {
          name: 'Test Rule',
          description: 'Test automation rule',
          trigger: {
            metric: 'overtime_hours',
            condition: 'greater_than',
            threshold: 15
          },
          action: {
            type: 'notification',
            channel: 'email',
            recipients: ['test@example.com']
          },
          status: 'active'
        }
      });
      expect(response.ok()).toBeTruthy();

      const body = await response.json();
      expect(body.name).toBe('Test Rule');
      expect(body.id).toBeDefined();
    });

    test('should update an automation rule', async ({ request }) => {
      // First create a rule
      const createResponse = await request.post('/api/v1/analytics/automation/rules', {
        data: {
          name: 'Update Test Rule',
          description: 'Rule to update',
          trigger: {
            metric: 'overtime_hours',
            condition: 'greater_than',
            threshold: 10
          },
          action: {
            type: 'notification',
            channel: 'slack'
          },
          status: 'active'
        }
      });
      const rule = await createResponse.json();

      // Then update it
      const updateResponse = await request.patch(`/api/v1/analytics/automation/rules/${rule.id}`, {
        data: {
          status: 'inactive'
        }
      });
      expect(updateResponse.ok()).toBeTruthy();

      const updatedRule = await updateResponse.json();
      expect(updatedRule.status).toBe('inactive');
    });
  });

  test.describe('Webhooks', () => {
    test('should get registered webhooks', async ({ request }) => {
      const response = await request.get('/api/v1/analytics/webhooks');
      expect(response.ok()).toBeTruthy();

      const body = await response.json();
      expect(Array.isArray(body)).toBe(true);
    });

    test('should handle GitLab webhook', async ({ request }) => {
      const response = await request.post('/api/v1/analytics/webhooks/gitlab', {
        headers: {
          'X-Gitlab-Event': 'Push Hook'
        },
        data: {
          event_name: 'push',
          ref: 'refs/heads/main',
          project_id: 123,
          commits: [
            {
              id: 'abc123',
              message: 'Test commit',
              author: { name: 'Test User', email: 'test@example.com' }
            }
          ]
        }
      });
      expect([200, 201, 202]).toContain(response.status());
    });

    test('should handle Jira webhook', async ({ request }) => {
      const response = await request.post('/api/v1/analytics/webhooks/jira', {
        data: {
          webhookEvent: 'jira:issue_updated',
          issue: {
            key: 'TEST-123',
            fields: {
              summary: 'Test issue',
              status: { name: 'Done' }
            }
          }
        }
      });
      expect([200, 201, 202]).toContain(response.status());
    });
  });

  test.describe('Integrations', () => {
    test('should get integration status', async ({ request }) => {
      const response = await request.get('/api/v1/analytics/integrations');
      expect(response.ok()).toBeTruthy();

      const body = await response.json();
      expect(Array.isArray(body) || typeof body === 'object').toBe(true);
    });

    test('should get specific integration status', async ({ request }) => {
      const response = await request.get('/api/v1/analytics/integrations/gitlab');
      expect([200, 404]).toContain(response.status());
    });
  });
});
