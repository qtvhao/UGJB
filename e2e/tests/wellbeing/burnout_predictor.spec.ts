import { test, expect } from '@playwright/test';
import burnoutPredictorFixture from '../../fixtures/burnout_predictor.json';

/**
 * E2E tests for Burnout Predictor service
 * Tests: services/workforce-wellbeing/microservices/burnout-predictor/
 *   - app/routers/predictions.py
 *   - app/routers/burnout_risks.py
 *   - app/routers/__init__.py
 */

test.describe('Burnout Predictor', () => {
  test.describe('Health Endpoints', () => {
    test('should return healthy status from /health endpoint', async ({ request }) => {
      const response = await request.get('/api/v1/wellbeing/burnout/health');
      expect(response.ok()).toBeTruthy();

      const body = await response.json();
      expect(body.status).toBe('healthy');
      expect(body.service).toBe('burnout-predictor');
      expect(body.model_loaded).toBe(true);
    });

    test('should return liveness status', async ({ request }) => {
      const response = await request.get('/api/v1/wellbeing/burnout/health/liveness');
      expect(response.ok()).toBeTruthy();

      const body = await response.json();
      expect(body.status).toBe('alive');
    });

    test('should return readiness status', async ({ request }) => {
      const response = await request.get('/api/v1/wellbeing/burnout/health/readiness');
      expect(response.ok()).toBeTruthy();

      const body = await response.json();
      expect(body.ready).toBe(true);
      expect(body.checks).toBeDefined();
      expect(body.checks.model_loaded).toBe(true);
    });
  });

  test.describe('Prediction Endpoints', () => {
    test('should predict burnout risk for an employee', async ({ request }) => {
      const response = await request.post('/api/v1/wellbeing/burnout/predictions/predict', {
        data: {
          employee_id: 'emp-001',
          metrics: burnoutPredictorFixture.sampleMetrics
        }
      });
      expect(response.ok()).toBeTruthy();

      const body = await response.json();
      expect(body.employee_id).toBe('emp-001');
      expect(body.risk_score).toBeGreaterThanOrEqual(0);
      expect(body.risk_score).toBeLessThanOrEqual(1);
      expect(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).toContain(body.risk_level);
      expect(body.top_risk_factors).toBeDefined();
      expect(body.recommendation).toBeDefined();
      expect(body.model_version).toBeDefined();
    });

    test('should handle batch predictions', async ({ request }) => {
      const response = await request.post('/api/v1/wellbeing/burnout/predictions/predict/batch', {
        data: {
          requests: [
            {
              employee_id: 'emp-001',
              metrics: burnoutPredictorFixture.sampleMetrics
            },
            {
              employee_id: 'emp-002',
              metrics: {
                ...burnoutPredictorFixture.sampleMetrics,
                stress_level: 3.0,
                overtime_hours: 2.0
              }
            }
          ]
        }
      });
      expect(response.ok()).toBeTruthy();

      const body = await response.json();
      expect(body.predictions).toHaveLength(2);
      expect(body.total_processed).toBe(2);
      expect(body.high_risk_count).toBeGreaterThanOrEqual(0);
    });

    test('should validate input metrics', async ({ request }) => {
      const response = await request.post('/api/v1/wellbeing/burnout/predictions/predict', {
        data: {
          employee_id: 'emp-001',
          metrics: {
            hours_worked_per_week: -5, // Invalid negative value
          }
        }
      });
      expect(response.status()).toBe(422); // Validation error
    });
  });

  test.describe('Model Information', () => {
    test('should return model info and performance metrics', async ({ request }) => {
      const response = await request.get('/api/v1/wellbeing/burnout/predictions/model/info');
      expect(response.ok()).toBeTruthy();

      const body = await response.json();
      expect(body.model_version).toBeDefined();
      expect(body.model_type).toBeDefined();
      expect(body.accuracy).toBeGreaterThanOrEqual(0);
      expect(body.accuracy).toBeLessThanOrEqual(1);
      expect(body.precision).toBeDefined();
      expect(body.recall).toBeDefined();
      expect(body.f1_score).toBeDefined();
      expect(body.feature_names).toBeDefined();
      expect(Array.isArray(body.feature_names)).toBe(true);
    });
  });

  test.describe('Risk Level Classification', () => {
    test('should return LOW risk for healthy metrics', async ({ request }) => {
      const response = await request.post('/api/v1/wellbeing/burnout/predictions/predict', {
        data: {
          employee_id: 'emp-healthy',
          metrics: {
            ...burnoutPredictorFixture.sampleMetrics,
            hours_worked_per_week: 40,
            overtime_hours: 0,
            stress_level: 2.0,
            sleep_hours_average: 8.0,
            work_life_balance_score: 9.0,
            job_satisfaction_score: 9.0
          }
        }
      });
      expect(response.ok()).toBeTruthy();

      const body = await response.json();
      expect(body.risk_level).toBe('LOW');
      expect(body.risk_score).toBeLessThan(0.3);
    });

    test('should return HIGH risk for concerning metrics', async ({ request }) => {
      const response = await request.post('/api/v1/wellbeing/burnout/predictions/predict', {
        data: {
          employee_id: 'emp-at-risk',
          metrics: {
            ...burnoutPredictorFixture.sampleMetrics,
            hours_worked_per_week: 60,
            overtime_hours: 20,
            stress_level: 9.0,
            sleep_hours_average: 4.0,
            work_life_balance_score: 2.0,
            job_satisfaction_score: 2.0,
            recent_performance_decline: true
          }
        }
      });
      expect(response.ok()).toBeTruthy();

      const body = await response.json();
      expect(['HIGH', 'CRITICAL']).toContain(body.risk_level);
      expect(body.risk_score).toBeGreaterThan(0.6);
    });
  });
});
