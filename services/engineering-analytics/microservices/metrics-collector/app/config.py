from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    app_name: str = "metrics-collector"
    debug: bool = False

    # Database
    database_url: str = "postgresql://postgres:postgres@localhost:5432/engineering_analytics_db"

    # Kafka
    kafka_bootstrap_servers: str = "localhost:9092"
    kafka_topic_metrics: str = "engineering-metrics"
    kafka_topic_events: str = "engineering-events"

    # External integrations
    jira_api_url: str = ""
    jira_api_token: str = ""
    gitlab_api_url: str = ""
    gitlab_api_token: str = ""
    firebase_project_id: str = ""
    firebase_credentials: str = ""
    prometheus_url: str = ""

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache
def get_settings() -> Settings:
    return Settings()
