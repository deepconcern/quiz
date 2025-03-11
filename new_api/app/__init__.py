from dotenv import load_dotenv

# Run before everything else

load_dotenv()

from flask import Flask

from .connectors import configure_connectors

app = Flask(__name__)

configure_connectors(app)

@app.get("/")
def health_check() -> str:
    return "OK"

