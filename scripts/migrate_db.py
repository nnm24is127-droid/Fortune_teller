"""
scripts/migrate_db.py

Safely migrates the SQLite database by adding missing columns to the readings table.
Preserves existing data.
"""

import sys
import os
import sqlite3

# Add root directory to python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.config import DATABASE_URL


def migrate():
    print("--- Checking and migrating database schema ---")
    if not DATABASE_URL.startswith("sqlite"):
        print("Non-SQLite database detected. Rely on standard migration.")
        return

    db_path = DATABASE_URL.replace("sqlite:///", "")
    if not os.path.exists(db_path):
        print(f"Database file '{db_path}' does not exist yet. It will be created automatically.")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Fetch existing columns in readings table
    cursor.execute("PRAGMA table_info(readings)")
    columns = [row[1] for row in cursor.fetchall()]

    if not columns:
        print("Readings table does not exist yet; will be created on app start.")
        conn.close()
        return

    new_columns = [
        ("astrologer_note", "TEXT"),
        ("reviewed_by", "INTEGER"),
        ("reviewed_at", "DATETIME")
    ]

    for col_name, col_type in new_columns:
        if col_name not in columns:
            print(f"Adding column '{col_name}' ({col_type}) to 'readings' table...")
            cursor.execute(f"ALTER TABLE readings ADD COLUMN {col_name} {col_type};")
        else:
            print(f"Column '{col_name}' already exists.")

    conn.commit()
    conn.close()
    print("Migration completed successfully!")


if __name__ == "__main__":
    migrate()
