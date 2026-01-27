from supabase import create_client
import os
from dotenv import load_dotenv

load_dotenv()  # ✅ THIS LINE IS REQUIRED

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    raise RuntimeError("Supabase environment variables not set")

supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
