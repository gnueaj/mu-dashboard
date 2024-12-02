from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import train, unlearn, data

# Constants
ALLOW_ORIGINS = ["*"]  # TODO: Update URL after deployment
# ALLOW_ORIGINS = ["http://localhost:3000"]

def setup_middleware(app: FastAPI) -> None:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=ALLOW_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

def register_routers(app: FastAPI) -> None:
    app.include_router(train.router)
    app.include_router(unlearn.router)
    app.include_router(data.router)

def create_app() -> FastAPI:
    app = FastAPI()
    setup_middleware(app)
    register_routers(app)
    return app

# Create application instance after all definitions
app = create_app()

@app.get("/")
async def root():
    return {"message": "Welcome to the MU Dashboard API"}