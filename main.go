package main

import (
	"database/sql"
	"fmt"
	"net/http"
    "log"
    _ "github.com/mattn/go-sqlite3"
)

var db *sql.DB

func index(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "./static/landing/index.html")
}

func main() {
	var err error
	db, err = sql.Open("sqlite3", "./main.db")
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	initializeEc(db)
    initializeSat(db)

    // Serve static files
    fs := http.FileServer(http.Dir("static"))
    http.Handle("/static/", http.StripPrefix("/static/", fs))
    
    // Handle root path
    http.HandleFunc("/", index)

	fmt.Println("Server is running on http://localhost:8080")
	http.ListenAndServe(":8080", nil)
}