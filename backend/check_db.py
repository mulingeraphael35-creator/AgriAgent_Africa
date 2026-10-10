
import sqlite3

conn = sqlite3.connect("agriagent.db")

print("SAVED ADVISORIES:")
for row in conn.execute(
    "SELECT id, status FROM advisories ORDER BY created_at DESC LIMIT 3"
):
    print(row)

print("\nRECENT AUDIT LOGS:")
for row in conn.execute(
    "SELECT actor, action, outcome FROM audit ORDER BY id DESC LIMIT 3"
):
    print(row)

conn.close()
