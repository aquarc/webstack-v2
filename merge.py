import sqlite3

## open the two databases
conn = sqlite3.connect("main.db")
questions = sqlite3.connect("cleaned.db")

## get the cursor
cur = conn.cursor()
cur2 = questions.cursor()


def merge():
    # create the database in main.db
    cur.execute("""
        CREATE TABLE IF NOT EXISTS sat_questions (
            questionId TEXT PRIMARY KEY NOT NULL,
            id TEXT NOT NULL,
            test TEXT NOT NULL,
            category TEXT NOT NULL,
            domain TEXT NOT NULl,
            skill TEXT NOT NULL,
            difficulty TEXT NOT NULL,
            details TEXT,
            question TEXT NOT NULL,
            answer_choices TEXT,
            answer TEXT NOT NULL,
            rationale TEXT NOT NULL
        )""")


    cur2.execute("SELECT * FROM sat_questions")
    rows = cur2.fetchall()
    cur.executemany("INSERT INTO sat_questions VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", rows)
    conn.commit()

merge()
