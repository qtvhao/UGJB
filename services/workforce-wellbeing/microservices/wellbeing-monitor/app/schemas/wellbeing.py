"""
Pydantic schemas for wellbeing-related entities.
"""

from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import UUID

from pydantic import BaseModel, Field, field_validator, ConfigDict


# WellbeingIndicator Schemas
class WellbeingIndicatorBase(BaseModel):
    """Base schema for wellbeing indicators."""

    employee_id: UUID = Field(..., description="UUID of the employee")
    indicator_type: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="Type of indicator (e.g., stress_level, mood, satisfaction)",
    )
    value: float = Field(
        ...,
        ge=0.0,
        le=100.0,
        description="Numeric value of the indicator (0-100)",
    )
    source: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="Source of the indicator (e.g., survey, activity_log, manual)",
    )
    source_id: Optional[UUID] = Field(
        None,
        description="Reference to the source entity",
    )
    metadata: Optional[Dict[str, Any]] = Field(
        None,
        description="Additional metadata",
    )
    recorded_at: Optional[datetime] = Field(
        None,
        description="When the indicator was recorded",
    )


class WellbeingIndicatorCreate(WellbeingIndicatorBase):
    """Schema for creating a wellbeing indicator."""

    pass


class WellbeingIndicatorResponse(WellbeingIndicatorBase):
    """Schema for wellbeing indicator response."""

    id: UUID = Field(..., description="Unique identifier")
    created_at: datetime = Field(..., description="Creation timestamp")

    model_config = ConfigDict(from_attributes=True)


# Survey Schemas
class SurveyBase(BaseModel):
    """Base schema for surveys."""

    employee_id: UUID = Field(..., description="UUID of the employee")
    survey_type: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="Type of survey (e.g., weekly_checkin, burnout_assessment)",
    )
    survey_version: str = Field(
        ...,
        min_length=1,
        max_length=50,
        description="Version of the survey template",
    )
    questions: List[Dict[str, Any]] = Field(
        ...,
        description="Survey questions with IDs and text",
    )
    responses: Dict[str, Any] = Field(
        ...,
        description="Survey responses mapped to question IDs",
    )
    overall_score: Optional[float] = Field(
        None,
        ge=0.0,
        le=100.0,
        description="Overall calculated score (0-100)",
    )
    dimension_scores: Optional[Dict[str, float]] = Field(
        None,
        description="Scores for different wellbeing dimensions",
    )
    is_completed: bool = Field(
        True,
        description="Whether the survey was fully completed",
    )
    completion_percentage: float = Field(
        100.0,
        ge=0.0,
        le=100.0,
        description="Percentage of questions answered",
    )
    notes: Optional[str] = Field(
        None,
        description="Additional notes or comments",
    )
    metadata: Optional[Dict[str, Any]] = Field(
        None,
        description="Additional metadata",
    )
    submitted_at: Optional[datetime] = Field(
        None,
        description="When the survey was submitted",
    )

    @field_validator("questions")
    @classmethod
    def validate_questions(cls, v: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Validate questions structure."""
        if not v:
            raise ValueError("Survey must have at least one question")
        if len(v) > 50:
            raise ValueError("Survey cannot have more than 50 questions")
        for question in v:
            if "id" not in question or "text" not in question:
                raise ValueError("Each question must have 'id' and 'text' fields")
        return v

    @field_validator("responses")
    @classmethod
    def validate_responses(cls, v: Dict[str, Any]) -> Dict[str, Any]:
        """Validate responses structure."""
        if not v:
            raise ValueError("Survey must have at least one response")
        return v


class SurveyCreate(SurveyBase):
    """Schema for creating a survey."""

    pass


class SurveyUpdate(BaseModel):
    """Schema for updating a survey."""

    responses: Optional[Dict[str, Any]] = Field(
        None,
        description="Updated survey responses",
    )
    overall_score: Optional[float] = Field(
        None,
        ge=0.0,
        le=100.0,
        description="Updated overall score",
    )
    dimension_scores: Optional[Dict[str, float]] = Field(
        None,
        description="Updated dimension scores",
    )
    is_completed: Optional[bool] = Field(
        None,
        description="Updated completion status",
    )
    completion_percentage: Optional[float] = Field(
        None,
        ge=0.0,
        le=100.0,
        description="Updated completion percentage",
    )
    notes: Optional[str] = Field(
        None,
        description="Updated notes",
    )
    metadata: Optional[Dict[str, Any]] = Field(
        None,
        description="Updated metadata",
    )


class SurveyResponse(SurveyBase):
    """Schema for survey response."""

    id: UUID = Field(..., description="Unique identifier")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")

    model_config = ConfigDict(from_attributes=True)


# ActivityLog Schemas
class ActivityLogBase(BaseModel):
    """Base schema for activity logs."""

    employee_id: UUID = Field(..., description="UUID of the employee")
    activity_type: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="Type of activity (e.g., login, logout, break_start)",
    )
    activity_category: Optional[str] = Field(
        None,
        max_length=100,
        description="Category of activity (e.g., work, break, meeting)",
    )
    duration_seconds: Optional[int] = Field(
        None,
        ge=0,
        description="Duration of the activity in seconds",
    )
    description: Optional[str] = Field(
        None,
        description="Detailed description of the activity",
    )
    metadata: Optional[Dict[str, Any]] = Field(
        None,
        description="Additional metadata",
    )
    source: str = Field(
        "system",
        min_length=1,
        max_length=100,
        description="Source of the log (e.g., system, user, integration)",
    )
    productivity_score: Optional[float] = Field(
        None,
        ge=0.0,
        le=100.0,
        description="Productivity score (0-100)",
    )
    stress_indicator: Optional[float] = Field(
        None,
        ge=0.0,
        le=100.0,
        description="Stress indicator (0-100)",
    )
    logged_at: Optional[datetime] = Field(
        None,
        description="When the activity was logged",
    )
    activity_start_time: Optional[datetime] = Field(
        None,
        description="When the activity started",
    )
    activity_end_time: Optional[datetime] = Field(
        None,
        description="When the activity ended",
    )

    @field_validator("activity_end_time")
    @classmethod
    def validate_end_time(cls, v: Optional[datetime], info) -> Optional[datetime]:
        """Validate that end time is after start time."""
        if v and info.data.get("activity_start_time"):
            if v < info.data["activity_start_time"]:
                raise ValueError("Activity end time must be after start time")
        return v


class ActivityLogCreate(ActivityLogBase):
    """Schema for creating an activity log."""

    pass


class ActivityLogUpdate(BaseModel):
    """Schema for updating an activity log."""

    duration_seconds: Optional[int] = Field(
        None,
        ge=0,
        description="Updated duration",
    )
    description: Optional[str] = Field(
        None,
        description="Updated description",
    )
    metadata: Optional[Dict[str, Any]] = Field(
        None,
        description="Updated metadata",
    )
    productivity_score: Optional[float] = Field(
        None,
        ge=0.0,
        le=100.0,
        description="Updated productivity score",
    )
    stress_indicator: Optional[float] = Field(
        None,
        ge=0.0,
        le=100.0,
        description="Updated stress indicator",
    )
    activity_end_time: Optional[datetime] = Field(
        None,
        description="Updated end time",
    )


class ActivityLogResponse(ActivityLogBase):
    """Schema for activity log response."""

    id: UUID = Field(..., description="Unique identifier")
    created_at: datetime = Field(..., description="Creation timestamp")

    model_config = ConfigDict(from_attributes=True)


# Batch operation schemas
class BatchWellbeingIndicatorCreate(BaseModel):
    """Schema for batch creating wellbeing indicators."""

    indicators: List[WellbeingIndicatorCreate] = Field(
        ...,
        description="List of indicators to create",
    )

    @field_validator("indicators")
    @classmethod
    def validate_indicators(cls, v: List[WellbeingIndicatorCreate]) -> List[WellbeingIndicatorCreate]:
        """Validate indicators list."""
        if not v:
            raise ValueError("Must provide at least one indicator")
        if len(v) > 100:
            raise ValueError("Cannot create more than 100 indicators at once")
        return v


class BatchActivityLogCreate(BaseModel):
    """Schema for batch creating activity logs."""

    logs: List[ActivityLogCreate] = Field(
        ...,
        description="List of activity logs to create",
    )

    @field_validator("logs")
    @classmethod
    def validate_logs(cls, v: List[ActivityLogCreate]) -> List[ActivityLogCreate]:
        """Validate logs list."""
        if not v:
            raise ValueError("Must provide at least one log")
        if len(v) > 1000:
            raise ValueError("Cannot create more than 1000 logs at once")
        return v
