import os
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import APIRouter, HTTPException, Response, Cookie, Header, status, Depends
from jose import JWTError, jwt
import bcrypt
from models import SignupRequest, LoginRequest, UserPublic
from database import users_collection
from bson import ObjectId

router = APIRouter()

# ── Config ─────────────────────────────────────────────────────────────────
SECRET_KEY = os.getenv("JWT_SECRET", "fallback-secret-do-not-use-in-prod")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
EXPIRE_DAYS = int(os.getenv("JWT_EXPIRE_DAYS", "7"))

COOKIE_NAME = "auth_token"


# ── Helpers ─────────────────────────────────────────────────────────────────
def hash_password(plain: str) -> str:
    return bcrypt.hashpw(plain.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode('utf-8'), hashed.encode('utf-8'))

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str) -> Optional[dict]:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        return None

def _set_auth_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        httponly=True,
        samesite="none",
        max_age=EXPIRE_DAYS * 24 * 3600,
        secure=True,
    )

def get_current_user_id(
    auth_token: Optional[str] = Cookie(default=None),
    authorization: Optional[str] = Header(default=None)
) -> str:
    token = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split("Bearer ")[1]
    elif auth_token:
        token = auth_token

    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated.")
    payload = decode_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token.")
    return payload["sub"]


# ── Routes ──────────────────────────────────────────────────────────────────

@router.post("/signup", status_code=status.HTTP_201_CREATED)
async def signup(body: SignupRequest, response: Response):
    """Create a new account."""
    # normalise email
    email = body.email.strip().lower()

    # check duplicate
    existing = await users_collection.find_one({"email": email})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists."
        )

    hashed = hash_password(body.password)
    doc = {
        "name": body.name.strip(),
        "email": email,
        "hashed_password": hashed,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    result = await users_collection.insert_one(doc)
    user_id = str(result.inserted_id)

    token = create_access_token({"sub": user_id, "email": email, "name": body.name.strip()})
    _set_auth_cookie(response, token)

    return UserPublic(id=user_id, name=body.name.strip(), email=email, has_completed_onboarding=False, access_token=token)


@router.post("/login")
async def login(body: LoginRequest, response: Response):
    """Authenticate and set JWT cookie."""
    email = body.email.strip().lower()
    user = await users_collection.find_one({"email": email})

    print(f"Email: {body.email}")
    print(f"Password: {body.password}")

    if not user or not verify_password(body.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    user_id = str(user["_id"])
    name = user.get("name", "")
    token = create_access_token({"sub": user_id, "email": email, "name": name})
    _set_auth_cookie(response, token)

    return UserPublic(id=user_id, name=name, email=email, has_completed_onboarding=user.get("has_completed_onboarding", False), access_token=token)


@router.post("/logout")
async def logout(response: Response):
    """Clear the auth cookie."""
    response.delete_cookie(key=COOKIE_NAME, samesite="none", secure=True)
    return {"message": "Logged out successfully."}


@router.get("/me")
async def me(user_id: str = Depends(get_current_user_id)):
    """Return current user info from JWT — used by the frontend on mount."""
    user = await users_collection.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found.")

    return UserPublic(
        id=user_id,
        name=user.get("name", ""),
        email=user.get("email", ""),
        has_completed_onboarding=user.get("has_completed_onboarding", False)
    )

@router.patch("/me/onboarding")
async def complete_onboarding(user_id: str = Depends(get_current_user_id)):
    """Mark onboarding as completed for the current user."""
    await users_collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"has_completed_onboarding": True}}
    )
    return {"message": "Onboarding completed successfully"}

