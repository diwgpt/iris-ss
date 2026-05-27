import os
from celery.schedules import crontab

ROW_LIMIT = 50000
SECRET_KEY = "<SECRET_KEY — set in deployment>"

SQLALCHEMY_DATABASE_URI = (
    "postgresql+psycopg2://superset:<DB_PASSWORD>@localhost:5432/superset_meta"
)

REDIS_URL = "redis://:<REDIS_PASSWORD>@localhost:6379/0"

CACHE_CONFIG = {
    "CACHE_TYPE": "RedisCache",
    "CACHE_DEFAULT_TIMEOUT": 300,
    "CACHE_KEY_PREFIX": "superset_",
    "CACHE_REDIS_URL": REDIS_URL,
}
DATA_CACHE_CONFIG = {
    "CACHE_TYPE": "RedisCache",
    "CACHE_DEFAULT_TIMEOUT": 600,
    "CACHE_KEY_PREFIX": "superset_data_",
    "CACHE_REDIS_URL": "redis://:<REDIS_PASSWORD>@localhost:6379/1",
}
FILTER_STATE_CACHE_CONFIG = {
    "CACHE_TYPE": "RedisCache",
    "CACHE_DEFAULT_TIMEOUT": 600,
    "CACHE_KEY_PREFIX": "superset_filter_",
    "CACHE_REDIS_URL": "redis://:<REDIS_PASSWORD>@localhost:6379/2",
}
EXPLORE_FORM_DATA_CACHE_CONFIG = {
    "CACHE_TYPE": "RedisCache",
    "CACHE_DEFAULT_TIMEOUT": 600,
    "CACHE_KEY_PREFIX": "superset_explore_",
    "CACHE_REDIS_URL": "redis://:<REDIS_PASSWORD>@localhost:6379/3",
}

class CeleryConfig:
    broker_url = "redis://:<REDIS_PASSWORD>@localhost:6379/4"
    result_backend = "redis://:<REDIS_PASSWORD>@localhost:6379/5"
    worker_prefetch_multiplier = 1
    task_acks_late = True
    beat_schedule = {
        "reports.scheduler": {
            "task": "reports.scheduler",
            "schedule": crontab(minute="*/10"),
        },
        "reports.prune_log": {
            "task": "reports.prune_log",
            "schedule": crontab(minute=0, hour=0),
        },
    }
CELERY_CONFIG = CeleryConfig

AUTH_TYPE = 1
AUTH_USER_REGISTRATION = False

FEATURE_FLAGS = {
    "EMBEDDED_SUPERSET": True,
    "DASHBOARD_RBAC": False,
    "ALERT_REPORTS": True,
    "ENABLE_TEMPLATE_PROCESSING": True,
    "DASHBOARD_NATIVE_FILTERS": True,
    "DASHBOARD_CROSS_FILTERS": True,
}

GUEST_TOKEN_JWT_SECRET = "<GUEST_TOKEN_JWT_SECRET — set in deployment>"
GUEST_TOKEN_JWT_ALGO = "HS256"
GUEST_TOKEN_JWT_EXP_SECONDS = 3600

ENABLE_CORS = True
CORS_OPTIONS = {
    "supports_credentials": True,
    "allow_headers": ["*"],
    "resources": ["*"],
    "origins": ["http://10.14.0.4", "http://iris.bpcl.in", "https://iris.bpcl.in", "http://localhost:3000"],
}
HTTP_HEADERS = {"X-Frame-Options": "ALLOWALL"}
TALISMAN_ENABLED = False

SUPERSET_WEBSERVER_TIMEOUT = 120
SQLLAB_TIMEOUT = 120
SQL_MAX_ROW = 100000

ENABLE_TIME_ROTATE = True
TIME_ROTATE_LOG_LEVEL = "INFO"
FILENAME = "/mnt/superset/logs/superset.log"
ROLLOVER = "midnight"
BACKUP_COUNT = 30

# Serve under /superset/ sub-path for reverse proxy embedding


# Audience claim for guest tokens must match the embedding domain
GUEST_TOKEN_JWT_AUDIENCE = "https://iris.bpcl.in/"
WEBDRIVER_BASEURL = "https://iris.bpcl.in/"
WEBDRIVER_BASEURL_USER_FRIENDLY = "https://iris.bpcl.in/"

# Enable the MCP Service
ENABLE_MCP_SERVICE = True

# For initial testing in your Prod environment,
# set a default user to map the AI's actions to:
MCP_DEV_USERNAME = "admin"  # Or your specific admin username

# Service discovery settings
MCP_SERVICE_HOST = "0.0.0.0"
MCP_SERVICE_PORT = 5008


# ── User-hierarchy Jinja function for embedded dashboards ─────────────────────
# get_guest_user_attribute(attr) reads extra fields from the guest JWT token's
# 'user' object. iris-go passes user_region, user_state, user_territory,
# user_sapids in the guest token so dataset SQL can scope queries per user.
#
# Superset 6.x doesn't ship this function built-in, so we register it here.
# g.user.guest_token contains the full decoded JWT payload including all extra
# fields passed by iris-go in the 'user' object.

def _get_guest_user_attribute(attr_name: str, default: str = "") -> str:
    try:
        from flask import g
        if hasattr(g, "user") and hasattr(g.user, "guest_token"):
            val = g.user.guest_token.get("user", {}).get(attr_name, default)
            if val is None or val == "":
                return default
            return str(val)
    except Exception:
        pass
    return default


JINJA_CONTEXT_ADDONS = {
    "get_guest_user_attribute": _get_guest_user_attribute,
}


# ── Default display timezone ──────────────────────────────────────────────────
# Applied to scheduled reports/alerts and server-rendered time strings.
# Browser time picker UX is already IST-local for IST users, but this keeps
# server-side time math (alert schedules, relative time ranges) in IST.
DEFAULT_TIMEZONE = "Asia/Kolkata"
