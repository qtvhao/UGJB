"""
Machine Learning model wrapper for burnout risk prediction
"""
import os
import logging
from datetime import datetime
from typing import List, Dict, Tuple, Optional
import numpy as np
import pandas as pd
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score
import xgboost as xgb

from app.config import settings

logger = logging.getLogger(__name__)


class BurnoutRiskModel:
    """Wrapper class for burnout risk prediction ML model"""

    def __init__(self, model_path: Optional[str] = None):
        """
        Initialize the burnout risk model

        Args:
            model_path: Path to saved model file. If None, creates a new model.
        """
        self.model_path = model_path or settings.model_path
        self.model = None
        self.feature_names = settings.feature_names
        self.model_version = settings.model_version
        self.model_type = settings.model_type
        self.last_trained = None
        self.training_samples_count = 0
        self.performance_metrics = {}

        # Load existing model or create new one
        if os.path.exists(self.model_path):
            self.load_model()
        else:
            logger.warning(f"Model file not found at {self.model_path}. Creating new model.")
            self._create_default_model()

    def _create_default_model(self):
        """Create a default XGBoost model with reasonable hyperparameters"""
        logger.info("Creating default XGBoost model")

        self.model = xgb.XGBClassifier(
            n_estimators=100,
            max_depth=6,
            learning_rate=0.1,
            subsample=0.8,
            colsample_bytree=0.8,
            objective='binary:logistic',
            random_state=42,
            eval_metric='auc'
        )

        # Initialize with some synthetic data for demonstration
        self._initialize_with_synthetic_data()

    def _initialize_with_synthetic_data(self):
        """Initialize model with synthetic training data for demonstration"""
        logger.info("Initializing model with synthetic data")

        np.random.seed(42)
        n_samples = 1000

        # Generate synthetic features
        X_synthetic = np.random.randn(n_samples, len(self.feature_names))

        # Create synthetic labels with some logic
        # Higher stress, lower sleep, more overtime -> higher burnout risk
        burnout_score = (
            X_synthetic[:, 8] * 0.3 +  # stress_level
            -X_synthetic[:, 9] * 0.2 +  # sleep_hours (negative correlation)
            X_synthetic[:, 1] * 0.2 +   # overtime_hours
            -X_synthetic[:, 11] * 0.15 + # work_life_balance (negative)
            -X_synthetic[:, 15] * 0.15   # job_satisfaction (negative)
        )
        y_synthetic = (burnout_score > 0).astype(int)

        # Train the model
        X_train, X_test, y_train, y_test = train_test_split(
            X_synthetic, y_synthetic, test_size=0.2, random_state=42
        )

        self.model.fit(X_train, y_train)

        # Evaluate
        y_pred = self.model.predict(X_test)
        y_pred_proba = self.model.predict_proba(X_test)[:, 1]

        self.performance_metrics = {
            'accuracy': accuracy_score(y_test, y_pred),
            'precision': precision_score(y_test, y_pred, zero_division=0),
            'recall': recall_score(y_test, y_pred, zero_division=0),
            'f1_score': f1_score(y_test, y_pred, zero_division=0),
            'roc_auc': roc_auc_score(y_test, y_pred_proba)
        }

        self.last_trained = datetime.utcnow()
        self.training_samples_count = n_samples

        logger.info(f"Model initialized with performance: {self.performance_metrics}")

        # Save the model
        self.save_model()

    def load_model(self):
        """Load model from disk"""
        try:
            logger.info(f"Loading model from {self.model_path}")
            model_data = joblib.load(self.model_path)

            self.model = model_data['model']
            self.model_version = model_data.get('version', self.model_version)
            self.model_type = model_data.get('type', self.model_type)
            self.last_trained = model_data.get('last_trained')
            self.training_samples_count = model_data.get('training_samples', 0)
            self.performance_metrics = model_data.get('performance', {})

            logger.info(f"Model loaded successfully. Version: {self.model_version}")
        except Exception as e:
            logger.error(f"Failed to load model: {e}")
            logger.info("Creating new model instead")
            self._create_default_model()

    def save_model(self):
        """Save model to disk"""
        try:
            # Create directory if it doesn't exist
            os.makedirs(os.path.dirname(self.model_path), exist_ok=True)

            model_data = {
                'model': self.model,
                'version': self.model_version,
                'type': self.model_type,
                'last_trained': self.last_trained,
                'training_samples': self.training_samples_count,
                'performance': self.performance_metrics,
                'feature_names': self.feature_names
            }

            joblib.dump(model_data, self.model_path)
            logger.info(f"Model saved to {self.model_path}")
        except Exception as e:
            logger.error(f"Failed to save model: {e}")

    def predict(self, features: Dict[str, float]) -> Tuple[float, Dict[str, float]]:
        """
        Predict burnout risk for given features

        Args:
            features: Dictionary of feature names to values

        Returns:
            Tuple of (risk_score, feature_importance)
        """
        if self.model is None:
            raise ValueError("Model not loaded or initialized")

        # Convert features dict to array in correct order
        feature_array = self._features_to_array(features)

        # Get prediction probability
        risk_score = float(self.model.predict_proba(feature_array)[0, 1])

        # Get feature importance
        feature_importance = self._calculate_feature_importance(features)

        return risk_score, feature_importance

    def batch_predict(self, features_list: List[Dict[str, float]]) -> List[Tuple[float, Dict[str, float]]]:
        """
        Predict burnout risk for multiple employees

        Args:
            features_list: List of feature dictionaries

        Returns:
            List of (risk_score, feature_importance) tuples
        """
        if self.model is None:
            raise ValueError("Model not loaded or initialized")

        # Convert all features to arrays
        feature_arrays = [self._features_to_array(f) for f in features_list]
        X = np.vstack(feature_arrays)

        # Get predictions
        risk_scores = self.model.predict_proba(X)[:, 1]

        # Calculate feature importance for each
        results = []
        for i, features in enumerate(features_list):
            feature_importance = self._calculate_feature_importance(features)
            results.append((float(risk_scores[i]), feature_importance))

        return results

    def train(
        self,
        training_data: List[Tuple[Dict[str, float], bool]],
        validate: bool = True
    ) -> Dict[str, float]:
        """
        Train or retrain the model with new data

        Args:
            training_data: List of (features, actual_burnout) tuples
            validate: Whether to validate before deployment

        Returns:
            Performance metrics dictionary
        """
        if len(training_data) < settings.min_training_samples:
            raise ValueError(
                f"Insufficient training data. Need at least {settings.min_training_samples} samples."
            )

        logger.info(f"Training model with {len(training_data)} samples")

        # Prepare data
        X = np.array([self._features_to_array(features) for features, _ in training_data])
        y = np.array([int(burnout) for _, burnout in training_data])

        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y,
            test_size=settings.model_validation_split,
            random_state=42,
            stratify=y if len(np.unique(y)) > 1 else None
        )

        # Create and train new model
        new_model = xgb.XGBClassifier(
            n_estimators=100,
            max_depth=6,
            learning_rate=0.1,
            subsample=0.8,
            colsample_bytree=0.8,
            objective='binary:logistic',
            random_state=42,
            eval_metric='auc'
        )

        new_model.fit(X_train, y_train)

        # Evaluate
        y_pred = new_model.predict(X_test)
        y_pred_proba = new_model.predict_proba(X_test)[:, 1]

        performance = {
            'accuracy': float(accuracy_score(y_test, y_pred)),
            'precision': float(precision_score(y_test, y_pred, zero_division=0)),
            'recall': float(recall_score(y_test, y_pred, zero_division=0)),
            'f1_score': float(f1_score(y_test, y_pred, zero_division=0)),
            'roc_auc': float(roc_auc_score(y_test, y_pred_proba))
        }

        logger.info(f"New model performance: {performance}")

        # Update model if validation passes or is not required
        if not validate or performance['roc_auc'] >= 0.6:  # Minimum acceptable AUC
            self.model = new_model
            self.performance_metrics = performance
            self.last_trained = datetime.utcnow()
            self.training_samples_count = len(training_data)

            # Increment version
            version_parts = self.model_version.split('.')
            version_parts[-1] = str(int(version_parts[-1]) + 1)
            self.model_version = '.'.join(version_parts)

            self.save_model()
            logger.info(f"Model updated to version {self.model_version}")
        else:
            logger.warning("New model did not meet validation criteria. Keeping existing model.")

        return performance

    def _features_to_array(self, features: Dict[str, float]) -> np.ndarray:
        """Convert features dictionary to numpy array in correct order"""
        feature_array = np.array([
            features.get(name, 0.0) for name in self.feature_names
        ]).reshape(1, -1)
        return feature_array

    def _calculate_feature_importance(self, features: Dict[str, float]) -> Dict[str, float]:
        """
        Calculate feature importance/contribution to the prediction

        Args:
            features: Feature dictionary

        Returns:
            Dictionary of feature names to importance scores
        """
        if not hasattr(self.model, 'feature_importances_'):
            return {}

        importance_scores = self.model.feature_importances_

        # Create importance dictionary
        importance_dict = {
            name: float(score)
            for name, score in zip(self.feature_names, importance_scores)
            if name in features
        }

        return importance_dict

    def get_top_risk_factors(
        self,
        feature_importance: Dict[str, float],
        top_n: int = 5
    ) -> List[Tuple[str, float, str]]:
        """
        Get top risk factors contributing to burnout risk

        Args:
            feature_importance: Feature importance dictionary
            top_n: Number of top factors to return

        Returns:
            List of (factor_name, contribution_score, description) tuples
        """
        # Sort by importance
        sorted_factors = sorted(
            feature_importance.items(),
            key=lambda x: x[1],
            reverse=True
        )[:top_n]

        # Risk factor descriptions for human-readable output
        factor_descriptions = {
            'stress_level': 'High stress levels detected',
            'overtime_hours': 'Excessive overtime hours',
            'sleep_hours_average': 'Insufficient sleep hours',
            'work_life_balance_score': 'Poor work-life balance',
            'job_satisfaction_score': 'Low job satisfaction',
            'days_since_last_vacation': 'Extended period without vacation',
            'consecutive_work_days': 'Too many consecutive work days',
            'overdue_tasks_count': 'High number of overdue tasks',
            'sick_days_last_month': 'Increased sick days',
            'recent_performance_decline': 'Recent decline in performance'
        }

        result = []
        for factor_name, score in sorted_factors:
            description = factor_descriptions.get(
                factor_name,
                f'{factor_name.replace("_", " ").title()}'
            )
            result.append((factor_name, score, description))

        return result

    def get_model_info(self) -> Dict:
        """Get model metadata and performance information"""
        return {
            'model_version': self.model_version,
            'model_type': self.model_type,
            'last_trained': self.last_trained.isoformat() if self.last_trained else None,
            'training_samples_count': self.training_samples_count,
            'performance_metrics': self.performance_metrics,
            'feature_names': self.feature_names
        }
