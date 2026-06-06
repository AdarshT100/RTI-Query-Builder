import os
from datetime import datetime, timedelta
from fastapi import HTTPException

_LIMIT_PER_HOUR: int = int(os.getenv("RATE_LIMIT_PER_HOUR") or "3")
_LIMIT_PER_DAY: int = int(os.getenv("RATE_LIMIT_PER_DAY") or "5")

_store : dict [str, list[datetime]] = {}

def check_rate_limit(ip:str) -> None:
    now = datetime.utcnow()
    window_hour = now - timedelta(hours=1)
    window_day = now - timedelta(hours=24)

    timestamps = _store.get(ip, [])

    # Remove timestamps outside the time windows
    timestamps = [ts for ts in timestamps if ts>window_day]

    count_hour = sum(1 for ts in timestamps if ts>window_hour)
    count_day = len(timestamps)

    if count_hour >= _LIMIT_PER_HOUR:
        raise HTTPException(status_code=429,detail="Hourly request limit reached. Please try again later.")
    
    if count_day >= _LIMIT_PER_DAY:
        raise HTTPException(status_code=429, detail="Daily request limit reached. Please try again later.")
    
    timestamps.append(now)
    _store[ip] = timestamps
