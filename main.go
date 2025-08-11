package main

import (
	"database/sql"
	"fmt"
	"log"
	"net"
	"net/http"
	"os"
	"os/signal"
	"path/filepath"
	"syscall"

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

func main() {
	// Parse command-line arguments
	var port = "8080"
	var unixSocketPath string

	args := os.Args[1:]
	for i := 0; i < len(args); i++ {
		switch args[i] {
		case "--port":
			if i+1 < len(args) {
				port = args[i+1]
				i++ // Skip next argument
			}
		case "--unix":
			if i+1 < len(args) {
				unixSocketPath = args[i+1]
				i++ // Skip next argument
			}
		default:
			// Treat standalone argument as port
			port = args[i]
		}
	}

	// Load environment variables from .env
	if err := godotenv.Load(); err != nil {
		log.Println("Warning: No .env file found - using environment variables")
	}

	// Build the PostgreSQL connection string.
	connectionString := ""
	if os.Getenv("DB_STRING") != "" {
		connectionString = os.Getenv("DB_STRING")
	} else {
		if os.Getenv("DB_PASSWORD") != "" {
			connectionString = fmt.Sprintf("user=%s password=%s host=%s port=%s dbname=%s sslmode=%s",
				os.Getenv("DB_USER"),
				os.Getenv("DB_PASSWORD"),
				os.Getenv("DB_HOST"),
				os.Getenv("DB_PORT"),
				os.Getenv("DB_NAME"),
				os.Getenv("DB_SSLMODE"),
			)
		} else {
			connectionString = fmt.Sprintf("user=%s host=%s port=%s dbname=%s sslmode=%s",
				os.Getenv("DB_USER"),
				os.Getenv("DB_HOST"),
				os.Getenv("DB_PORT"),
				os.Getenv("DB_NAME"),
				os.Getenv("DB_SSLMODE"),
			)
		}
	}

	log.Println("Connecting to DB...")

	var err error
	db, err = sql.Open("postgres", connectionString)
	if err != nil {
		log.Fatal("Error connecting to the database:", err)
	}
	defer db.Close()
	log.Println("Connected")

	// Initialize additional modules.
	// initializeEc(db)
	initializeSat(db)
	initializeAI(db)

	// Register static file handlers.
	//http.HandleFunc("/ec", indexThing)
	http.HandleFunc("/sat", indexThing)
	http.HandleFunc("/notes", indexThing)
	http.HandleFunc("/feedback", indexThing)
	http.HandleFunc("/", index)
	http.HandleFunc("/signup", indexThing)
	http.HandleFunc("/dashboard", indexThing)
	http.HandleFunc("/dashboard/practice-exams", indexThing)
	http.HandleFunc("/dashboard/games", indexThing)
	http.HandleFunc("/dashboard/performance", indexThing)
	http.HandleFunc("/dashboard/practice-history", indexThing)
	http.HandleFunc("/dashboard/your-friends", indexThing)
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
		Debug:            true, // Enable for debugging
	}).Handler(http.DefaultServeMux)

	// Create server
	server := &http.Server{Handler: handler}

	// Start server based on socket type
	if unixSocketPath != "" {
		// Ensure directory exists
		if err := os.MkdirAll(filepath.Dir(unixSocketPath), 0755); err != nil {
			log.Fatalf("Failed to create socket directory: %v", err)
		}

		// Remove existing socket file if it exists
		if _, err := os.Stat(unixSocketPath); err == nil {
			if err := os.Remove(unixSocketPath); err != nil {
				log.Fatalf("Failed to remove existing socket: %v", err)
			}
		}

		// Create Unix listener
		listener, err := net.Listen("unix", unixSocketPath)
		if err != nil {
			log.Fatalf("Failed to create Unix listener: %v", err)
		}

		// Set socket permissions
		if err := os.Chmod(unixSocketPath, 0777); err != nil {
			log.Printf("Warning: Could not set socket permissions: %v", err)
		}

		// Handle SIGINT to clean up socket
		sigChan := make(chan os.Signal, 1)
		signal.Notify(sigChan, os.Interrupt, syscall.SIGTERM)
		go func() {
			<-sigChan
			os.Remove(unixSocketPath)
			os.Exit(0)
		}()

		log.Printf("Server is running on Unix socket: %s", unixSocketPath)
		if err := server.Serve(listener); err != nil {
			log.Fatalf("Server error: %v", err)
		}
	} else {
		addr := fmt.Sprintf(":%s", port)
		log.Printf("Server is running on http://localhost%s", addr)
		if err := http.ListenAndServe(addr, handler); err != nil {
			log.Fatal(err)
		}
	}
}
