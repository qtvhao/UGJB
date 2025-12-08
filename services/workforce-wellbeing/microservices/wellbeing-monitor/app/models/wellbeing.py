"""
Database models for wellbeing-related entities.
"""

from datetime import datetime
from typing import Optional
from uuid import uuid4

from sqlalchemy import (
    JSON,
    Boolean,
    Column,
    DateTime,
    Float,
    Index,
    Integer,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import UUID

from app.database import Base


class WellbeingIndicator(Base):
    """
    Time-series data for wellbeing indicators.

    This table is configured as a TimescaleDB hypertable for efficient
    time-series data storage and querying.
    """

    __tablename__ = "wellbeing_indicators"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)

    # Employee reference
    employee_id = Column(UUID(as_uuid=True), nullable=False, index=True)

    # Indicator metadata
    indicator_type = Column(
        String(100),
        nullable=False,
        index=True,
        comment="Type of indicator (e.g., stress_level, mood, satisfaction)",
    )

    # Indicator value
    value = Column(
        Float,
        nullable=False,
        comment="Numeric value of the indicator (normalized 0-100)",
    )

    # Optional metadata
    metadata = Column(
        JSON,
        nullable=True,
        comment="Additional metadata about the indicator",
    )

    # Source information
    source = Column(
        String(100),
        nullable=False,
        comment="Source of the indicator (e.g., survey, activity_log, manual)",
    )

    source_id = Column(
        UUID(as_uuid=True),
        nullable=True,
        comment="Reference to the source entity",
    )

    # Temporal fields
    recorded_at = Column(
        DateTime(timezone=True),
        nullable=False,
        index=True,
        default=datetime.utcnow,
        comment="When the indicator was recorded",
    )

    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=datetime.utcnow,
        comment="When the record was created",
    )

    # Add composite indexes
    __table_args__ = (
        Index("idx_employee_type_time", "employee_id", "indicator_type", "recorded_at"),
        Index("idx_type_time", "indicator_type", "recorded_at"),
    )


class Survey(Base):
    """
    Survey responses from employees.

    Stores wellbeing survey data including questions, answers,
    and calculated scores.
    """

    __tablename__ = "surveys"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)

    # Employee reference
    employee_id = Column(UUID(as_uuid=True), nullable=False, index=True)

    # Survey metadata
    survey_type = Column(
        String(100),
        nullable=False,
        index=True,
        comment="Type of survey (e.g., weekly_checkin, burnout_assessment, satisfaction)",
    )

    survey_version = Column(
        String(50),
        nullable=False,
        comment="Version of the survey template",
    )

    # Survey content
    questions = Column(
        JSON,
        nullable=False,
        comment="Survey questions with IDs and text",
    )

    responses = Column(
        JSON,
        nullable=False,
        comment="Survey responses mapped to question IDs",
    )

    # Calculated scores
    overall_score = Column(
        Float,
        nullable=True,
        comment="Overall calculated score (0-100)",
    )

    dimension_scores = Column(
        JSON,
        nullable=True,
        comment="Scores for different wellbeing dimensions",
    )

    # Status and completion
    is_completed = Column(
        Boolean,
        nullable=False,
        default=True,
        comment="Whether the survey was fully completed",
    )

    completion_percentage = Column(
        Float,
        nullable=False,
        default=100.0,
        comment="Percentage of questions answered",
    )

    # Temporal fields
    submitted_at = Column(
        DateTime(timezone=True),
        nullable=False,
        index=True,
        default=datetime.utcnow,
        comment="When the survey was submitted",
    )

    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=datetime.utcnow,
        comment="When the record was created",
    )

    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        comment="When the record was last updated",
    )

    # Optional fields
    notes = Column(
        Text,
        nullable=True,
        comment="Additional notes or comments from the employee",
    )

    metadata = Column(
        JSON,
        nullable=True,
        comment="Additional metadata about the survey",
    )

    # Add composite indexes
    __table_args__ = (
        Index("idx_employee_survey_time", "employee_id", "survey_type", "submitted_at"),
        Index("idx_survey_type_time", "survey_type", "submitted_at"),
    )


class ActivityLog(Base):
    """
    Activity logs tracking employee work patterns and behaviors.

    This table is configured as a TimescaleDB hypertable for efficient
    time-series data storage and querying.
    """

    __tablename__ = "activity_logs"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)

    # Employee reference
    employee_id = Column(UUID(as_uuid=True), nullable=False, index=True)

    # Activity metadata
    activity_type = Column(
        String(100),
        nullable=False,
        index=True,
        comment="Type of activity (e.g., login, logout, break_start, break_end, task_completion)",
    )

    activity_category = Column(
        String(100),
        nullable=True,
        comment="Category of activity (e.g., work, break, meeting, focus_time)",
    )

    # Activity details
    duration_seconds = Column(
        Integer,
        nullable=True,
        comment="Duration of the activity in seconds",
    )

    description = Column(
        Text,
        nullable=True,
        comment="Detailed description of the activity",
    )

    # Activity metadata
    metadata = Column(
        JSON,
        nullable=True,
        comment="Additional metadata about the activity",
    )

    # Source information
    source = Column(
        String(100),
        nullable=False,
        default="system",
        comment="Source of the log (e.g., system, user, integration)",
    )

    # Productivity and wellbeing indicators
    productivity_score = Column(
        Float,
        nullable=True,
        comment="Productivity score derived from the activity (0-100)",
    )

    stress_indicator = Column(
        Float,
        nullable=True,
        comment="Stress indicator derived from the activity (0-100)",
    )

    # Temporal fields
    logged_at = Column(
        DateTime(timezone=True),
        nullable=False,
        index=True,
        default=datetime.utcnow,
        comment="When the activity was logged",
    )

    activity_start_time = Column(
        DateTime(timezone=True),
        nullable=True,
        comment="When the activity started",
    )

    activity_end_time = Column(
        DateTime(timezone=True),
        nullable=True,
        comment="When the activity ended",
    )

    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=datetime.utcnow,
        comment="When the record was created",
    )

    # Add composite indexes
    __table_args__ = (
        Index("idx_employee_activity_time", "employee_id", "activity_type", "logged_at"),
        Index("idx_activity_type_time", "activity_type", "logged_at"),
        Index("idx_activity_category_time", "activity_category", "logged_at"),
    )
