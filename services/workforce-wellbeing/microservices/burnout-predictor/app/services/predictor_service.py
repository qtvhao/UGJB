"""
Burnout prediction service with Kafka integration

Associated Frontend Files:
  - web/app/src/lib/api.ts (wellbeingApi.burnoutRisk - lines 143-147)
  - web/app/src/pages/wellbeing/BurnoutRiskPage.tsx
"""
import json
import logging
from datetime import datetime
from typing import Dict, List, Optional, Tuple
from enum import Enum

from app.config import settings
from app.models.risk_model import BurnoutRiskModel

logger = logging.getLogger(__name__)


class RiskLevel(str, Enum):
    """Burnout risk level classification"""
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class PredictorService:
    """Service for burnout risk prediction and alert generation"""

    def __init__(self):
        """Initialize the predictor service"""
        self.model = BurnoutRiskModel()
        self.kafka_producer = None

        # Initialize Kafka producer if enabled
        if settings.kafka_enabled:
            self._init_kafka_producer()

    def _init_kafka_producer(self):
        """Initialize Kafka producer for alerts"""
        try:
            from kafka import KafkaProducer

            self.kafka_producer = KafkaProducer(
                bootstrap_servers=settings.kafka_bootstrap_servers.split(','),
                value_serializer=lambda v: json.dumps(v).encode('utf-8'),
                key_serializer=lambda k: k.encode('utf-8') if k else None,
                acks='all',
                retries=3,
                max_in_flight_requests_per_connection=1
            )
            logger.info(f"Kafka producer initialized: {settings.kafka_bootstrap_servers}")
        except Exception as e:
            logger.error(f"Failed to initialize Kafka producer: {e}")
            self.kafka_producer = None

    def predict_burnout_risk(
        self,
        employee_id: str,
        metrics: Dict[str, float]
    ) -> Dict:
        """
        Predict burnout risk for an employee

        Args:
            employee_id: Employee identifier
            metrics: Employee metrics dictionary

        Returns:
            Prediction result dictionary
        """
        try:
            # Get prediction from model
            risk_score, feature_importance = self.model.predict(metrics)

            # Classify risk level
            risk_level = self._classify_risk_level(risk_score)

            # Get top risk factors
            top_risk_factors = self.model.get_top_risk_factors(feature_importance, top_n=5)

            # Generate recommendation
            recommendation = self._generate_recommendation(risk_level, top_risk_factors)

            # Build prediction result
            prediction_result = {
                'employee_id': employee_id,
                'risk_score': risk_score,
                'risk_level': risk_level.value,
                'top_risk_factors': [
                    {
                        'factor_name': name,
                        'contribution_score': score,
                        'description': desc
                    }
                    for name, score, desc in top_risk_factors
                ],
                'recommendation': recommendation,
                'prediction_timestamp': datetime.utcnow().isoformat(),
                'model_version': self.model.model_version
            }

            # Send to Kafka
            self._publish_prediction(prediction_result)

            # Send high-risk alert if applicable
            if risk_level in [RiskLevel.HIGH, RiskLevel.CRITICAL]:
                self._publish_high_risk_alert(prediction_result)

            return prediction_result

        except Exception as e:
            logger.error(f"Error predicting burnout risk for {employee_id}: {e}")
            raise

    def batch_predict_burnout_risk(
        self,
        requests: List[Tuple[str, Dict[str, float]]]
    ) -> Dict:
        """
        Batch predict burnout risk for multiple employees

        Args:
            requests: List of (employee_id, metrics) tuples

        Returns:
            Batch prediction results
        """
        predictions = []
        high_risk_count = 0

        for employee_id, metrics in requests:
            try:
                prediction = self.predict_burnout_risk(employee_id, metrics)
                predictions.append(prediction)

                if prediction['risk_level'] in ['HIGH', 'CRITICAL']:
                    high_risk_count += 1

            except Exception as e:
                logger.error(f"Error in batch prediction for {employee_id}: {e}")
                continue

        return {
            'predictions': predictions,
            'total_processed': len(predictions),
            'high_risk_count': high_risk_count
        }

    def retrain_model(
        self,
        training_data: List[Tuple[Dict[str, float], bool]],
        validate: bool = True
    ) -> Dict:
        """
        Retrain the model with new data

        Args:
            training_data: List of (metrics, actual_burnout) tuples
            validate: Whether to validate before deployment

        Returns:
            Retraining result dictionary
        """
        try:
            logger.info(f"Retraining model with {len(training_data)} samples")

            performance = self.model.train(training_data, validate=validate)

            return {
                'success': True,
                'new_model_version': self.model.model_version,
                'performance': performance,
                'message': f'Model successfully retrained to version {self.model.model_version}'
            }

        except Exception as e:
            logger.error(f"Error retraining model: {e}")
            return {
                'success': False,
                'new_model_version': self.model.model_version,
                'performance': {},
                'message': f'Model retraining failed: {str(e)}'
            }

    def get_model_info(self) -> Dict:
        """Get model information and performance metrics"""
        model_info = self.model.get_model_info()

        return {
            'model_version': model_info['model_version'],
            'model_type': model_info['model_type'],
            'accuracy': model_info['performance_metrics'].get('accuracy', 0.0),
            'precision': model_info['performance_metrics'].get('precision', 0.0),
            'recall': model_info['performance_metrics'].get('recall', 0.0),
            'f1_score': model_info['performance_metrics'].get('f1_score', 0.0),
            'last_trained_timestamp': model_info['last_trained'],
            'training_samples_count': model_info['training_samples_count'],
            'feature_names': model_info['feature_names']
        }

    def _classify_risk_level(self, risk_score: float) -> RiskLevel:
        """Classify risk score into risk level"""
        if risk_score < settings.risk_threshold_low:
            return RiskLevel.LOW
        elif risk_score < settings.risk_threshold_medium:
            return RiskLevel.MEDIUM
        elif risk_score < settings.risk_threshold_high:
            return RiskLevel.HIGH
        else:
            return RiskLevel.CRITICAL

    def _generate_recommendation(
        self,
        risk_level: RiskLevel,
        top_risk_factors: List[Tuple[str, float, str]]
    ) -> str:
        """Generate recommendation based on risk level and factors"""
        recommendations = {
            RiskLevel.LOW: (
                "Employee shows low burnout risk. Continue monitoring wellbeing metrics. "
                "Maintain current work-life balance practices."
            ),
            RiskLevel.MEDIUM: (
                "Moderate burnout risk detected. Recommend: 1) Schedule check-in with manager, "
                "2) Review workload distribution, 3) Encourage use of wellness resources."
            ),
            RiskLevel.HIGH: (
                "High burnout risk identified. Immediate actions needed: 1) Manager intervention required, "
                "2) Reduce workload and overtime, 3) Provide access to mental health support, "
                "4) Consider time off or vacation."
            ),
            RiskLevel.CRITICAL: (
                "CRITICAL burnout risk. Urgent intervention required: 1) Immediate manager and HR involvement, "
                "2) Mandatory workload reduction, 3) Enforce vacation/time off, "
                "4) Provide professional mental health support, 5) Daily wellbeing check-ins."
            )
        }

        base_recommendation = recommendations[risk_level]

        # Add specific factor-based recommendations
        if top_risk_factors:
            top_factor_name = top_risk_factors[0][0]

            factor_specific = {
                'stress_level': 'Focus on stress management techniques and workload reduction.',
                'overtime_hours': 'Reduce overtime immediately and enforce work hour limits.',
                'sleep_hours_average': 'Address sleep deprivation through schedule adjustments.',
                'work_life_balance_score': 'Improve work-life balance with flexible scheduling.',
                'job_satisfaction_score': 'Address job satisfaction through career development discussions.'
            }

            if top_factor_name in factor_specific:
                base_recommendation += f" {factor_specific[top_factor_name]}"

        return base_recommendation

    def _publish_prediction(self, prediction: Dict):
        """Publish prediction to Kafka topic"""
        if not settings.kafka_enabled or not self.kafka_producer:
            return

        try:
            self.kafka_producer.send(
                settings.kafka_topic_predictions,
                key=prediction['employee_id'],
                value=prediction
            )
            logger.debug(f"Published prediction for {prediction['employee_id']} to Kafka")
        except Exception as e:
            logger.error(f"Failed to publish prediction to Kafka: {e}")

    def _publish_high_risk_alert(self, prediction: Dict):
        """Publish high-risk alert to Kafka topic"""
        if not settings.alert_enabled or not self.kafka_producer:
            return

        try:
            alert = {
                'alert_type': 'HIGH_BURNOUT_RISK',
                'employee_id': prediction['employee_id'],
                'risk_level': prediction['risk_level'],
                'risk_score': prediction['risk_score'],
                'top_risk_factors': prediction['top_risk_factors'],
                'recommendation': prediction['recommendation'],
                'timestamp': prediction['prediction_timestamp'],
                'model_version': prediction['model_version'],
                'severity': 'HIGH' if prediction['risk_level'] == 'HIGH' else 'CRITICAL'
            }

            self.kafka_producer.send(
                settings.kafka_topic_high_risk_alerts,
                key=prediction['employee_id'],
                value=alert
            )
            logger.warning(
                f"HIGH RISK ALERT: Employee {prediction['employee_id']} - "
                f"Risk Level: {prediction['risk_level']}"
            )
        except Exception as e:
            logger.error(f"Failed to publish high-risk alert to Kafka: {e}")

    def close(self):
        """Close Kafka producer and cleanup resources"""
        if self.kafka_producer:
            try:
                self.kafka_producer.flush()
                self.kafka_producer.close()
                logger.info("Kafka producer closed")
            except Exception as e:
                logger.error(f"Error closing Kafka producer: {e}")


# Global service instance
predictor_service = PredictorService()
