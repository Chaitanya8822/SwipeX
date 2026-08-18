import sys
sys.path.append("w:/Projects/SwipeX/backend")
from app.database import engine
from app import models

def upgrade():
    print("Creating new tables...")
    models.Base.metadata.create_all(bind=engine)
    print("Done!")

if __name__ == "__main__":
    upgrade()
