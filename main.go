package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/joho/godotenv"
	_ "github.com/lib/pq"

	"github.com/rs/cors"
)

var db *sql.DB

// index serves index.html at the root path and static files from the build directory.
func index(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path == "/" {
		http.ServeFile(w, r, "./frontend/build/index.html")
		return
	}
	filePath := "./frontend/build" + r.URL.Path
	if _, err := os.Stat(filePath); err == nil {
		http.ServeFile(w, r, filePath)
		return
	}
	http.NotFound(w, r)
}

// indexThing loads index.html from the build directory.
func indexThing(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "./frontend/build/index.html")
}

// Add this to your main.go
func serveStatic(w http.ResponseWriter, r *http.Request) {
    path := "./frontend/build" + r.URL.Path
    
    // Set the correct Content-Type based on file extension
    if strings.HasSuffix(path, ".css") {
        w.Header().Set("Content-Type", "text/css")
    } else if strings.HasSuffix(path, ".js") {
        w.Header().Set("Content-Type", "application/javascript")
    }
    
    http.ServeFile(w, r, path)
}

func main() {
	// Load environment variables from .env
	if err := godotenv.Load(); err != nil {
		log.Fatal("Error loading .env file")
	}

	var connectionSB strings.Builder
	user := os.Getenv("DB_USER")
	password := os.Getenv("DB_PASSWORD")
	host := os.Getenv("DB_HOST")
	port := os.Getenv("DB_PORT")
	name := os.Getenv("DB_NAME")
	sslmode := os.Getenv("DB_SSLMODE")

	if len(user) != 0 {
		connectionSB.WriteString("user=")
		connectionSB.WriteString(user)
	}
	if len(password) != 0 {
		connectionSB.WriteString(" password=")
		connectionSB.WriteString(password)
	}
	if len(host) != 0 {
		connectionSB.WriteString(" host=")
		connectionSB.WriteString(host)
	}
	if len(port) != 0 {
		connectionSB.WriteString(" port=")
		connectionSB.WriteString(port)
	}
	if len(name) != 0 {
		connectionSB.WriteString(" dbname=")
		connectionSB.WriteString(name)
	}
	if len(sslmode) != 0 {
		connectionSB.WriteString(" sslmode=")
		connectionSB.WriteString(sslmode)
	}

	// Build the PostgreSQL connection string.
	connectionString := fmt.Sprintf("user=%s password=%s host=%s port=%s dbname=%s sslmode=%s",
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_HOST"),
		os.Getenv("DB_PORT"),
		os.Getenv("DB_NAME"),
		os.Getenv("DB_SSLMODE"),
	)

	log.Println("DB Connection String:", connectionString)

	var err error
	db, err = sql.Open("postgres", connectionString)
	if err != nil {
		log.Fatal("Error connecting to the database:", err)
	}
	defer db.Close()

	// Initialize additional modules.
	initializeEc(db)
	initializeSat(db)
    initializeAI(db)

	// Register static file handlers.
	http.HandleFunc("/sat", indexThing)
	//http.HandleFunc("/extracurricular", indexThing)
	http.HandleFunc("/feedback", indexThing)
	http.HandleFunc("/", index)
	http.HandleFunc("/signup", indexThing)
	http.HandleFunc("/dashboard", indexThing)
	http.HandleFunc("/login", indexThing)
	http.HandleFunc("/overview", indexThing)
	http.HandleFunc("/analytics", indexThing)
	http.HandleFunc("/ec-finder", indexThing)
	http.HandleFunc("/sat-prep", indexThing)

	// Set up CORS with credentials enabled.
	handler := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000", "https://aquarc.org"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}).Handler(http.DefaultServeMux)

	fmt.Println("Server is running on http://localhost:8080")
	if err := http.ListenAndServe(":8080", handler); err != nil {
		log.Fatal(err)
	}
}
