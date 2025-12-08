from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    app_name: str = "kpi-engine"
    debug: bool = False

    # gRPC
    grpc_port: int = 50052

    # Database
    database_url: str = "postgresql://postgres:postgres@localhost:5432/engineering_analytics_db"

    # Kafka
    kafka_bootstrap_servers: str = "localhost:9092"
    kafka_topic_threshold_breaches: str = "kpi-threshold-breaches"

    # Metrics Collector Service
    metrics_collector_url: str = "http://localhost:8031"

    # Thresholds
    deployment_frequency_threshold: float = 1.0  # per day
    lead_time_threshold_hours: float = 24.0
    change_failure_rate_threshold: float = 15.0  # percentage
    mttr_threshold_hours: float = 1.0
    quality_score_threshold: float = 70.0
    reliability_score_threshold: float = 99.0

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache
def get_settings() -> Settings:
    return Settings()
