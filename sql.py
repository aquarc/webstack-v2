# use pandas lol
import sys

import pandas
import sqlite3

conn = sqlite3.connect("main.db")

df = pandas.read_csv(sys.argv[1])
df.to_sql(sys.argv[2], conn, if_exists="replace", index=False)
