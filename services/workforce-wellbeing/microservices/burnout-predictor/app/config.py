"""
Configuration settings for Burnout Predictor service
"""
from typing import List
from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    """Application settings and configuration"""

    # Service Information
    service_name: str = "burnout-predictor"
    service_version: str = "1.0.0"
    environment: str = Field(default="development", env="ENVIRONMENT")

    # Server Configuration
    rest_host: str = Field(default="0.0.0.0", env="REST_HOST")
    rest_port: int = Field(default=8072, env="REST_PORT")
    grpc_host: str = Field(default="0.0.0.0", env="GRPC_HOST")
    grpc_port: int = Field(default=50054, env="GRPC_PORT")

    # Model Configuration
    model_path: str = Field(default="/app/models/burnout_model.pkl", env="MODEL_PATH")
    model_version: str = Field(default="1.0.0", env="MODEL_VERSION")
    model_type: str = Field(default="XGBoost", env="MODEL_TYPE")

    # Feature names for the model
    feature_names: List[str] = [
        "hours_worked_per_week",
        "overtime_hours",
        "days_since_last_vacation",
        "consecutive_work_days",
        "average_daily_meetings",
        "task_completion_rate",
        "open_tasks_count",
        "overdue_tasks_count",
        "stress_level",
        "sleep_hours_average",
        "exercise_frequency",
        "work_life_balance_score",
        "productivity_score",
        "team_collaboration_score",
        "days_since_last_feedback",
        "job_satisfaction_score",
        "sick_days_last_month",
        "late_logins_count",
        "average_response_time_hours",
        "recent_performance_decline"
    ]

    # Risk level thresholds
    risk_threshold_low: float = Field(default=0.3, env="RISK_THRESHOLD_LOW")
    risk_threshold_medium: float = Field(default=0.5, env="RISK_THRESHOLD_MEDIUM")
    risk_threshold_high: float = Field(default=0.7, env="RISK_THRESHOLD_HIGH")

    # Kafka Configuration
    kafka_bootstrap_servers: str = Field(
        default="localhost:9092",
        env="KAFKA_BOOTSTRAP_SERVERS"
    )
    kafka_topic_high_risk_alerts: str = Field(
        default="burnout.high-risk-alerts",
        env="KAFKA_TOPIC_HIGH_RISK_ALERTS"
    )
    kafka_topic_predictions: str = Field(
        default="burnout.predictions",
        env="KAFKA_TOPIC_PREDICTIONS"
    )
    kafka_enabled: bool = Field(default=True, env="KAFKA_ENABLED")

    # Alert Configuration
    alert_high_risk_threshold: float = Field(default=0.7, env="ALERT_HIGH_RISK_THRESHOLD")
    alert_enabled: bool = Field(default=True, env="ALERT_ENABLED")

    # Model Training Configuration
    training_enabled: bool = Field(default=True, env="TRAINING_ENABLED")
    min_training_samples: int = Field(default=100, env="MIN_TRAINING_SAMPLES")
    model_validation_split: float = Field(default=0.2, env="MODEL_VALIDATION_SPLIT")

    # Logging Configuration
    log_level: str = Field(default="INFO", env="LOG_LEVEL")
    log_format: str = Field(
        default="json",
        env="LOG_FORMAT",
        description="Log format: json or text"
    )

    # Monitoring Configuration
    metrics_enabled: bool = Field(default=True, env="METRICS_ENABLED")
    metrics_port: int = Field(default=9090, env="METRICS_PORT")

    # CORS Configuration
    cors_origins: List[str] = Field(
        default=["*"],
        env="CORS_ORIGINS",
        description="Allowed CORS origins"
    )

    # Database Configuration (for storing predictions and model metadata)
    database_url: str = Field(
        default="postgresql://user:password@localhost:5432/burnout_predictor",
        env="DATABASE_URL"
    )
    database_enabled: bool = Field(default=False, env="DATABASE_ENABLED")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False


# Global settings instance
settings = Settings()
