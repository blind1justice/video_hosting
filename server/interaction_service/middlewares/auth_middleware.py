from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from config.settings import settings

class InternalAuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        internal_token = request.headers.get("X-Internal-Token")
        
        if not internal_token or internal_token != settings.internal_api_key:
            return JSONResponse(
                status_code=403,
                content={"detail": "Forbidden"}
            )
        
        return await call_next(request)
