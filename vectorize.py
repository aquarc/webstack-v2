from google import genai
from google.genai import types
from google.api_core import retry
import psycopg2

from markdownify import markdownify as md

from os import getenv


def sanitize(text):
    return md(text.replace("<u>", "[Underlined]").replace("</u>", "[End]"))

client = genai.Client(api_key=getenv("GEMINI_API_KEY"))

is_retriable = lambda e: (isinstance(e, genai.errors.APIError) and e.code in {429, 503})

genai.models.Models.generate_content = retry.Retry(
    predicate=is_retriable)(genai.models.Models.generate_content)

for m in client.models.list():
    if "embedContent" in m.supported_actions:
        print(m.name)



conn = psycopg2.connect("dbname=sat user=aquarc host=aquarc.org port=5432 password=" + 
                        getenv("DB_PASSWORD")) 
cur = conn.cursor()

# Get all text to embed
cur.execute("SELECT id, details, question FROM vec_sat_questions WHERE embedding IS NULL")
rows = cur.fetchall()
i = len(rows)

# Batch update embeddings
for row_id, text, question in rows:
    embedding = client.models.embed_content(
            model="models/text-embedding-004",
            contents=sanitize(text + "\n" + question),
            config=types.EmbedContentConfig(
                task_type='retrieval_document',
            ),
        ).embeddings[0].values
    cur.execute("""
        UPDATE vec_sat_questions 
        SET embedding = %s::vector 
        WHERE id = %s AND embedding IS NULL
    """, (embedding, row_id))
    i -= 1
    print("Updated", row_id, ": ", i, "remaining")
    conn.commit()
