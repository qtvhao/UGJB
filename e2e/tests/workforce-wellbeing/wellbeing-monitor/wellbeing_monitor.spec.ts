import { test, expect } from '@playwright/test';
import wellbeingMonitorFixture from '../../../fixtures/workforce-wellbeing/wellbeing-monitor/wellbeing_monitor.json';

/**
 * E2E tests for Wellbeing Monitor service
 * Tests: services/workforce-wellbeing/microservices/wellbeing-monitor/
 *   - app/routers/__init__.py
 *   - app/routers/wellbeing.py
 */

test.describe('Wellbeing Monitor', () => {
  test.describe('Health Endpoints', () => {
    test('should return healthy status from /health endpoint', async ({ request }) => {
      const response = await request.get('/api/v1/wellbeing/health');
      expect(response.ok()).toBeTruthy();

      const body = await response.json();
      expect(body.status).toBe('healthy');
      expect(body.service).toBe('wellbeing-monitor');
    });

    test('should return readiness status', async ({ request }) => {
      const response = await request.get('/api/v1/wellbeing/health/ready');
      expect(response.ok()).toBeTruthy();

      const body = await response.json();
      expect(['ready', 'not_ready']).toContain(body.status);
      expect(body.database).toBeDefined();
    });

    test('should return liveness status', async ({ request }) => {
      const response = await request.get('/api/v1/wellbeing/health/live');
      expect(response.ok()).toBeTruthy();

      const body = await response.json();
      expect(body.status).toBe('alive');
    });
  });

  test.describe('Wellbeing Indicators', () => {
    const sampleIndicator = wellbeingMonitorFixture.indicators[0];

    test('should create a wellbeing indicator', async ({ request }) => {
      const response = await request.post('/api/v1/wellbeing/indicators', {
        data: {
          employee_id: 'emp-test-001',
          indicator_type: 'stress_level',
          value: 5.0,
          source: 'test',
          metadata: { test: true }
        }
      });
      expect(response.ok()).toBeTruthy();

      const body = await response.json();
      expect(body.employee_id).toBe('emp-test-001');
      expect(body.indicator_type).toBe('stress_level');
      expect(body.value).toBe(5.0);
      expect(body.id).toBeDefined();
    });

    test('should create indicators in batch', async ({ request }) => {
      const response = await request.post('/api/v1/wellbeing/indicators/batch', {
        data: {
          indicators: [
            {
              employee_id: 'emp-test-001',
              indicator_type: 'stress_level',
              value: 5.0,
              source: 'test'
            },
            {
              employee_id: 'emp-test-001',
              indicator_type: 'sleep_hours',
              value: 7.0,
              source: 'test'
            }
          ]
        }
      });
      expect(response.ok()).toBeTruthy();

      const body = await response.json();
      expect(Array.isArray(body)).toBe(true);
      expect(body).toHaveLength(2);
    });

    test('should get indicators for an employee', async ({ request }) => {
      const response = await request.get('/api/v1/wellbeing/employees/emp-001/indicators');
      expect(response.ok()).toBeTruthy();

      const body = await response.json();
      expect(Array.isArray(body)).toBe(true);
    });

    test('should filter indicators by type', async ({ request }) => {
      const response = await request.get('/api/v1/wellbeing/employees/emp-001/indicators?indicator_type=stress_level');
      expect(response.ok()).toBeTruthy();

      const body = await response.json();
      expect(Array.isArray(body)).toBe(true);
      body.forEach((indicator: any) => {
        expect(indicator.indicator_type).toBe('stress_level');
      });
    });

    test('should get indicator aggregates', async ({ request }) => {
      const response = await request.get('/api/v1/wellbeing/employees/emp-001/indicators/aggregates?indicator_type=stress_level&start_date=2024-01-01T00:00:00Z&end_date=2024-12-31T23:59:59Z');
      expect(response.ok()).toBeTruthy();

      const body = await response.json();
      expect(body.average).toBeDefined();
      expect(body.minimum).toBeDefined();
      expect(body.maximum).toBeDefined();
      expect(body.count).toBeDefined();
    });
  });

  test.describe('Surveys', () => {
    const sampleSurvey = wellbeingMonitorFixture.surveys[0];

    test('should create a survey', async ({ request }) => {
      const response = await request.post('/api/v1/wellbeing/surveys', {
        data: {
          employee_id: 'emp-test-001',
          survey_type: 'weekly_wellness',
          survey_version: '1.0',
          questions: sampleSurvey.questions,
          responses: { q1: 5, q2: 7 },
          overall_score: 6.0,
          is_completed: true,
          completion_percentage: 100
        }
      });
      expect(response.ok()).toBeTruthy();

      const body = await response.json();
      expect(body.employee_id).toBe('emp-test-001');
      expect(body.survey_type).toBe('weekly_wellness');
      expect(body.id).toBeDefined();
    });

    test('should get surveys for an employee', async ({ request }) => {
      const response = await request.get('/api/v1/wellbeing/employees/emp-001/surveys');
      expect(response.ok()).toBeTruthy();

      const body = await response.json();
      expect(Array.isArray(body)).toBe(true);
    });

    test('should update a survey', async ({ request }) => {
      // First create a survey
      const createResponse = await request.post('/api/v1/wellbeing/surveys', {
        data: {
          employee_id: 'emp-test-001',
          survey_type: 'weekly_wellness',
          survey_version: '1.0',
          questions: [],
          responses: {},
          is_completed: false,
          completion_percentage: 50
        }
      });
      const survey = await createResponse.json();

      // Then update it
      const updateResponse = await request.patch(`/api/v1/wellbeing/surveys/${survey.id}`, {
        data: {
          is_completed: true,
          completion_percentage: 100
        }
      });
      expect(updateResponse.ok()).toBeTruthy();

      const updatedSurvey = await updateResponse.json();
      expect(updatedSurvey.is_completed).toBe(true);
      expect(updatedSurvey.completion_percentage).toBe(100);
    });
  });

  test.describe('Activity Logs', () => {
    const sampleLog = wellbeingMonitorFixture.activityLogs[0];

    test('should create an activity log', async ({ request }) => {
      const response = await request.post('/api/v1/wellbeing/activity-logs', {
        data: {
          employee_id: 'emp-test-001',
          activity_type: 'meeting',
          activity_category: 'collaboration',
          duration_seconds: 3600,
          description: 'Test meeting',
          source: 'test'
        }
      });
      expect(response.ok()).toBeTruthy();

      const body = await response.json();
      expect(body.employee_id).toBe('emp-test-001');
      expect(body.activity_type).toBe('meeting');
      expect(body.id).toBeDefined();
    });

    test('should create activity logs in batch', async ({ request }) => {
      const response = await request.post('/api/v1/wellbeing/activity-logs/batch', {
        data: {
          logs: [
            {
              employee_id: 'emp-test-001',
              activity_type: 'meeting',
              activity_category: 'collaboration',
              duration_seconds: 3600,
              source: 'test'
            },
            {
              employee_id: 'emp-test-001',
              activity_type: 'coding',
              activity_category: 'development',
              duration_seconds: 7200,
              source: 'test'
            }
          ]
        }
      });
      expect(response.ok()).toBeTruthy();

      const body = await response.json();
      expect(Array.isArray(body)).toBe(true);
      expect(body).toHaveLength(2);
    });

    test('should get activity logs for an employee', async ({ request }) => {
      const response = await request.get('/api/v1/wellbeing/employees/emp-001/activity-logs');
      expect(response.ok()).toBeTruthy();

      const body = await response.json();
      expect(Array.isArray(body)).toBe(true);
    });

    test('should get activity log aggregates', async ({ request }) => {
      const response = await request.get('/api/v1/wellbeing/employees/emp-001/activity-logs/aggregates');
      expect(response.ok()).toBeTruthy();

      const body = await response.json();
      expect(body.count).toBeDefined();
      expect(body.total_duration_seconds).toBeDefined();
    });
  });
});
