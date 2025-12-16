"""
Routers package for API endpoints

Associated Frontend Files:
  - web/app/src/lib/api.ts (wellbeingApi - lines 141-152)
"""
from app.routers import health, predictions, burnout_risks

__all__ = ['health', 'predictions', 'burnout_risks']
