package main

import (
	"database/sql"
	"fmt"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
	"log"
	"net/http"
	"os"
)

var db *sql.DB

// Serve index.html at the root path ("/") and static files in the build directory
func index(w http.ResponseWriter, r *http.Request) {
	// If the request path is "/", serve index.html
	if r.URL.Path == "/" {
		http.ServeFile(w, r, "./frontend/build/index.html")
		return
	}

	// Check if the file exists in the build directory (other static assets)
	filePath := "./frontend/build" + r.URL.Path
	if _, err := os.Stat(filePath); err == nil {
		// File exists, serve it
		http.ServeFile(w, r, filePath)
		return
	}

	// If the file doesn't exist, return a 404 Not Found
	http.NotFound(w, r)
}

func indexThing(w http.ResponseWriter, r *http.Request) {
	// load index.html from static/
	http.ServeFile(w, r, "./frontend/build/index.html")
}

func main() {
	var err error
	err = godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}
	connectionString := fmt.Sprintf("user=%s password=%s host=%s port=%s dbname=%s sslmode=%s",
		os.Getenv("DB_USER"), os.Getenv("DB_PASSWORD"), os.Getenv("DB_HOST"), os.Getenv("DB_PORT"), os.Getenv("DB_NAME"), os.Getenv("DB_SSLMODE"))
	log.Println(connectionString)
	db, err = sql.Open("postgres", connectionString)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	initializeEc(db)
	initializeSat(db)

	// Serve the index handler and other static files
	http.HandleFunc("/sat", indexThing)
	http.HandleFunc("/extracurricular", indexThing)
	http.HandleFunc("/feedback", indexThing)
	http.HandleFunc("/", index)
	http.HandleFunc("/signup", indexThing)
	http.HandleFunc("/dashboard", indexThing)
	http.HandleFunc("/login", indexThing)


	fmt.Println("Server is running on http://localhost:8080")
	http.ListenAndServe(":8080", nil)
}
