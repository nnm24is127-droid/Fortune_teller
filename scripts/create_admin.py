"""
scripts/create_admin.py

Run this CLI script to create the initial admin user or promote an existing user.
Usage:
    python scripts/create_admin.py
"""

import sys
import os

# Add root directory to python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal
from app.models import User
from app.auth import hash_password


def create_or_promote_admin():
    db = SessionLocal()
    try:
        print("--- AstroTeller Admin Setup ---")
        username = input("Enter admin username: ").strip()
        email = input("Enter admin email: ").strip()

        if not username or not email:
            print("Error: Username and email cannot be empty.")
            return

        existing_user = db.query(User).filter(
            (User.username == username) | (User.email == email)
        ).first()

        if existing_user:
            confirm = input(
                f"User '{existing_user.username}' already exists with role '{existing_user.role}'. "
                f"Promote to 'admin'? (y/n): "
            ).strip().lower()

            if confirm == "y":
                existing_user.role = "admin"
                db.commit()
                print(f"Success: User '{existing_user.username}' is now an admin!")
            else:
                print("Operation cancelled.")
            return

        password = input("Enter admin password (min 6 characters): ").strip()
        if len(password) < 6:
            print("Error: Password must be at least 6 characters.")
            return

        admin_user = User(
            username=username,
            email=email,
            password_hash=hash_password(password),
            role="admin"
        )
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        print(f"Success: Admin user '{admin_user.username}' created successfully!")

    finally:
        db.close()


if __name__ == "__main__":
    create_or_promote_admin()
