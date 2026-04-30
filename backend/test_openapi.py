import traceback
from main import app

try:
    app.openapi()
    print("OpenAPI OK")
except Exception as e:
    traceback.print_exc()
