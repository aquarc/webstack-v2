package main

import (
	"bytes"
	"crypto/rand"
	"crypto/sha512"
	"crypto/tls"
	"database/sql"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"log"
	"math/big"
	"net/http"
	"os"
	"time"

	_ "github.com/joho/godotenv/autoload"
	"github.com/lib/pq"
	"gopkg.in/gomail.v2"
)

// -----------------------------
// Type Definitions
// -----------------------------

// QuestionDetails holds question info.
type QuestionDetails struct {
	QuestionID    string `json:"questionId"`
	ID            string `json:"id"`
	Test          string `json:"test"`
	Category      string `json:"category"`
	Domain        string `json:"domain"`
	Skill         string `json:"skill"`
	Difficulty    string `json:"difficulty"`
	Details       string `json:"details"`
	Question      string `json:"question"`
	AnswerChoices string `json:"answerChoices"`
	Answer        string `json:"answer"`
	Rationale     string `json:"rationale"`
}

// SATQuestion is used to query questions via JSON.
type SATQuestion struct {
	Test       string   `json:"test"`
	Difficulty []string `json:"difficulty"`
	Subdomain  []string `json:"subdomain"`
}

// Credentials holds user registration/login info.
type Credentials struct {
	Email    string `json:"email"`
	Username string `json:"username"`
	Password string `json:"password"`
}

// Verification holds email verification data.
type Verification struct {
	Email string `json:"email"`
	Code  string `json:"code"`
}

// Type defintion for timing data
type TopicTiming struct {
	Email     string `json:"email"`
	Topic     string `json:"topic"`
	TimeSpent int    `json:"timeSpent"`
}

// -----------------------------
// Global Email Dialer
// -----------------------------

var email gomail.Dialer // configured in initializeSat

// -----------------------------
// Helper Functions
// -----------------------------

// generateSessionToken creates a random 32-byte token and returns it as a hex string.
func generateSessionToken() (string, error) {
	tokenBytes := make([]byte, 32)
	if _, err := rand.Read(tokenBytes); err != nil {
		return "", err
	}
	return fmt.Sprintf("%x", tokenBytes), nil
}

// -----------------------------
// HTTP Handlers for SAT Module
// -----------------------------

// indexSat serves a SAT practice page.
func indexSat(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "./frontend/sat/pages/practice.html")
}

// findQuestions executes a query based on provided filters.
func findQuestions(w http.ResponseWriter, r *http.Request, test, category, domain, skill, difficulty string) {
	query := `
        SELECT questionId
        FROM sat_questions
        WHERE test = $1
          AND category = $2
          AND domain = $3
          AND skill = $4
          AND difficulty = $5`

	rows, err := db.Query(query, test, category, domain, skill, difficulty)
	if err != nil {
		http.Error(w, "Failed to query database", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var questionId string
	matchingQuestions := []string{}
	for rows.Next() {
		if err := rows.Scan(&questionId); err != nil {
			log.Fatal(err)
		}
		matchingQuestions = append(matchingQuestions, questionId)
	}

	if len(matchingQuestions) > 0 {
		viewQuestionDetails(w, matchingQuestions)
	} else {
		fmt.Fprintln(w, `<html><body>No questions found matching the filters.</body></html>`)
	}
}

// viewQuestionDetails retrieves details for each question and returns a JSON response.
func viewQuestionDetails(w http.ResponseWriter, matchingQuestions []string) {
	var questions []QuestionDetails

	for _, questionId := range matchingQuestions {
		queryDetails := `
			SELECT questionId, id, test, category, domain, skill, difficulty, details,
			       question, answer_choices, answer, rationale
			FROM sat_questions
			WHERE questionId = $1`

		var question QuestionDetails
		err := db.QueryRow(queryDetails, questionId).Scan(
			&question.QuestionID, &question.ID, &question.Test, &question.Category, &question.Domain,
			&question.Skill, &question.Difficulty, &question.Details, &question.Question,
			&question.AnswerChoices, &question.Answer, &question.Rationale,
		)
		if err != nil {
			if err == sql.ErrNoRows {
				log.Printf("No question found with ID: %s", questionId)
				continue
			} else {
				log.Printf("Error querying for questionId %s: %v", questionId, err)
				http.Error(w, "Error querying the database", http.StatusInternalServerError)
				return
			}
		}
		questions = append(questions, question)
	}

	jsonData, err := json.Marshal(questions)
	if err != nil {
		log.Printf("Error converting questions to JSON: %v", err)
		http.Error(w, "Error generating JSON response", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(jsonData)
}

// ServeForm displays an HTML form for filtering questions.
func ServeForm(w http.ResponseWriter, r *http.Request) {
	fmt.Fprint(w, `
		<html>
		<body>
			<h1>Find Questions</h1>
			<form action="/sat/find-questions" method="post">
				Test: <input type="text" name="test"><br>
				Category: <input type="text" name="category"><br>
				Domain: <input type="text" name="domain"><br>
				Skill: <input type="text" name="skill"><br>
				Difficulty: <input type="text" name="difficulty"><br>
				<input type="submit" value="Submit">
			</form>
		</body>
		</html>
	`)
}

// FindQuestionsHandler handles form submissions and calls findQuestions.
func FindQuestionsHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method == "POST" {
		test := r.FormValue("test")
		category := r.FormValue("category")
		domain := r.FormValue("domain")
		skill := r.FormValue("skill")
		difficulty := r.FormValue("difficulty")
		findQuestions(w, r, test, category, domain, skill, difficulty)
	} else {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
	}
}

// FindQuestionsHandlerv2 parses a JSON request and queries questions accordingly.
func FindQuestionsHandlerv2(w http.ResponseWriter, r *http.Request) {
	var data SATQuestion

	if r.Body == nil || r.ContentLength == 0 {
		http.Error(w, "Request body is empty", http.StatusBadRequest)
		return
	}

	err := json.NewDecoder(r.Body).Decode(&data)
	if err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	query := `
		SELECT questionId, id, test, category, domain, skill, difficulty, details,
		       question, answer_choices, answer, rationale
		FROM sat_questions
		WHERE test = $1
		  AND difficulty = ANY($2)
		  AND skill = ANY($3);
	`
	diffArray := pq.Array(data.Difficulty)
	subdomainArray := pq.Array(data.Subdomain)
	rows, err := db.Query(query, data.Test, diffArray, subdomainArray)
	if err != nil {
		http.Error(w, "Error querying: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var questions []QuestionDetails
	for rows.Next() {
		var question QuestionDetails
		err = rows.Scan(&question.QuestionID, &question.ID, &question.Test,
			&question.Category, &question.Domain, &question.Skill,
			&question.Difficulty, &question.Details, &question.Question,
			&question.AnswerChoices, &question.Answer, &question.Rationale)
		if err != nil {
			http.Error(w, "Error querying the database: "+err.Error(), http.StatusInternalServerError)
			return
		}
		questions = append(questions, question)
	}

	jsonData, err := json.Marshal(questions)
	if err != nil {
		log.Printf("Error converting questions to JSON: %v", err)
		http.Error(w, "Error generating JSON response", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(jsonData)
}

// register handles user registration, password hashing, and sends a verification email.
func register(w http.ResponseWriter, r *http.Request) {
	var data Credentials
	if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
		log.Printf("Error decoding request body: %v", err)
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	var existingEmail string
	var isVerified bool
	err := db.QueryRow("SELECT email, verified FROM users WHERE email = $1", data.Email).Scan(&existingEmail, &isVerified)
	if err != sql.ErrNoRows {
		if err == nil {
			if isVerified {
				http.Error(w, "Email already registered", http.StatusConflict)
				return
			} else {
				_, _ = db.Exec("DELETE FROM verification_codes WHERE email = $1", data.Email)
			}
		} else {
			log.Printf("Database error checking email: %v", err)
			http.Error(w, "Internal server error", http.StatusInternalServerError)
		}
		return
	}

	// Generate salt and hash password.
	generatedSalt := make([]byte, 16)
	_, err = rand.Read(generatedSalt)
	if err != nil {
		log.Printf("Error generating salt: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}
	saltedPassword := make([]byte, len(generatedSalt)+len(data.Password))
	copy(saltedPassword, generatedSalt)
	copy(saltedPassword[len(generatedSalt):], []byte(data.Password))
	hashedPassword := sha512.Sum512(saltedPassword)

	// Convert hash and salt to hex strings.
	hashedPasswordHex := fmt.Sprintf("%x", hashedPassword[:])
	saltHex := fmt.Sprintf("%x", generatedSalt)

	_, err = db.Exec(`
        INSERT INTO users (email, username, password, salt, verified) 
        VALUES ($1, $2, $3, $4, $5)`,
		data.Email,
		data.Username,
		hashedPasswordHex,
		saltHex,
		0,
	)
	if err != nil {
		log.Printf("Database error during insert: %v", err)
		http.Error(w, "Error creating user: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Generate and store verification code.
	randomCode, err := rand.Int(rand.Reader, big.NewInt(1e7))
	if err != nil {
		log.Printf("Error generating verification code: %v", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}
	randomCodeString := fmt.Sprintf("%07d", randomCode.Int64())

	_, err = db.Exec(`
        INSERT INTO verification_codes (email, code, timestamp) 
        VALUES ($1, $2, EXTRACT(EPOCH FROM NOW())::bigint)`,
		data.Email,
		randomCodeString,
	)
	if err != nil {
		log.Printf("Error storing verification code: %v", err)
		http.Error(w, "Error storing verification code", http.StatusInternalServerError)
		return
	}

	// Send verification email.
	emailMessage := gomail.NewMessage()
	emailMessage.SetHeader("From", "contact@aquarc.org")
	emailMessage.SetHeader("To", data.Email)
	emailMessage.SetHeader("Subject", "Aquarc Verification Code")
	emailMessage.SetBody("text/plain", fmt.Sprintf(`Hi %s,
Thank you so much for supporting Aquarc! Your verification code is: %s

Feel free to reach out if you need help in your high school journey.

Best,
Om
CEO of Aquarc`, data.Username, randomCodeString))

	dialer := gomail.NewDialer("mail.privateemail.com", 587, "contact@aquarc.org", os.Getenv("PASSWORD"))
	dialer.TLSConfig = &tls.Config{InsecureSkipVerify: true}

	if err := dialer.DialAndSend(emailMessage); err != nil {
		log.Printf("Error sending email: %v", err)
		http.Error(w, "Failed to send verification email", http.StatusInternalServerError)
		return
	}

	// Optionally, automatically log the user in by setting a session cookie.
	sessionToken, err := generateSessionToken()
	if err != nil {
		log.Printf("Error generating session token: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}
	http.SetCookie(w, &http.Cookie{
		Name:     "session",
		Value:    sessionToken,
		Path:     "/",
		HttpOnly: true,
		Secure:   true, // set to true in production with HTTPS
		SameSite: http.SameSiteStrictMode,
		MaxAge:   86400 * 7, // 7 days
	})

	http.SetCookie(w, &http.Cookie{
		Name:     "username",
		Value:    data.Username,
		Path:     "/",
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteStrictMode,
		MaxAge:   86400 * 7, // 7 days
	})

	log.Printf("✅ Successfully registered user and sent verification code to: %s", data.Email)
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("User registered successfully. Please check your email for verification code."))
}

// registerVerificationCode verifies a user's email using a provided code.
func registerVerificationCode(w http.ResponseWriter, r *http.Request) {
	var data Verification
	if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	var code string
	var timestamp int64
	err := db.QueryRow("SELECT code, timestamp FROM verification_codes WHERE email = $1 ORDER BY timestamp DESC LIMIT 1",
		data.Email).Scan(&code, &timestamp)
	if err != nil {
		http.Error(w, "Email not currently registering", http.StatusBadRequest)
		return
	}

	if code != data.Code {
		http.Error(w, "Verification Code does not match", http.StatusForbidden)
		return
	}

	if time.Now().Unix()-timestamp > 10*60 {
		log.Println(timestamp)
		log.Println(time.Now().Unix())
		http.Error(w, "Verification Code has Expired", http.StatusNotFound)
		return
	}

	_, err = db.Exec("UPDATE users SET verified = 1 WHERE email = $1", data.Email)
	if err != nil {
		http.Error(w, "Error updating user verification", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("User verified successfully"))
}

// login handles user login by verifying credentials and sets a session cookie.
func login(w http.ResponseWriter, r *http.Request) {
	var data Credentials
	if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	var username string
	var storedPasswordHex string
	var storedSaltHex string
	var verified int

	err := db.QueryRow(`
        SELECT username, password, salt, verified 
        FROM users 
        WHERE email = $1`, data.Email).Scan(&username, &storedPasswordHex, &storedSaltHex, &verified)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "User Does Not Exist", http.StatusBadRequest)
		} else {
			log.Printf("Database error: %v", err)
			http.Error(w, "Internal server error", http.StatusInternalServerError)
		}
		return
	}

	storedPasswordBytes, err := hex.DecodeString(storedPasswordHex)
	if err != nil {
		log.Printf("Error decoding stored password: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	storedSaltBytes, err := hex.DecodeString(storedSaltHex)
	if err != nil {
		log.Printf("Error decoding stored salt: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	saltedPassword := make([]byte, len(storedSaltBytes)+len(data.Password))
	copy(saltedPassword, storedSaltBytes)
	copy(saltedPassword[len(storedSaltBytes):], []byte(data.Password))
	hashedPassword := sha512.Sum512(saltedPassword)

	if !bytes.Equal(storedPasswordBytes, hashedPassword[:]) {
		http.Error(w, "Password does not match", http.StatusForbidden)
		return
	}

	// Generate a new session token.
	sessionToken, err := generateSessionToken()
	if err != nil {
		log.Printf("Error generating session token: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	// Store session in database with expiration time
	expiresAt := time.Now().Add(7 * 24 * time.Hour) // 7 days
	_, err = db.Exec(
		"INSERT INTO user_sessions (token, email, expires_at) VALUES ($1, $2, $3)",
		sessionToken, data.Email, expiresAt,
	)
	if err != nil {
		log.Printf("Error storing session: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	// Set the session cookie.
	http.SetCookie(w, &http.Cookie{
		Name:     "session",
		Value:    sessionToken,
		Path:     "/",
		HttpOnly: true,
		Secure:   true, // set to true in production with HTTPS
		SameSite: http.SameSiteStrictMode,
		MaxAge:   86400 * 7, // 7 days
	})

	// Set username cookie
	http.SetCookie(w, &http.Cookie{
		Name:     "username",
		Value:    username,
		Path:     "/",
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteStrictMode,
		MaxAge:   86400 * 7, // 7 days
	})

	// Optionally return user data.
	json.NewEncoder(w).Encode(map[string]string{
		"message": "User logged in successfully",
		"email":   data.Email,
	})
}

// Funciton for recording time for each topic
func recordTopicTiming(w http.ResponseWriter, r *http.Request) {
	// Get email from the session cookie
	cookie, err := r.Cookie("session")
	if err != nil {
		http.Error(w, "Unauthorized: No session cookie", http.StatusUnauthorized)
		return
	}

	sessionToken := cookie.Value

	// Look up email from session token (you'll need to implement this)
	var email string
	err = db.QueryRow("SELECT email FROM user_sessions WHERE token = $1", sessionToken).Scan(&email)
	if err != nil {
		http.Error(w, "Unauthorized: Invalid session", http.StatusUnauthorized)
		return
	}

	var timing TopicTiming
	if err := json.NewDecoder(r.Body).Decode(&timing); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Use the email from the session
	timing.Email = email

	// Insert or update the timing record
	_, err = db.Exec(`
        INSERT INTO user_topic_timings (email, topic, time_spent)
        VALUES ($1, $2, $3)
        ON CONFLICT (email, topic) DO UPDATE
        SET time_spent = user_topic_timings.time_spent + $3
    `, timing.Email, timing.Topic, timing.TimeSpent)

	if err != nil {
		log.Printf("Error recording topic timing: %v", err)
		http.Error(w, "Failed to record timing data", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

// Add this function to handle fetching practice times
func getPracticeTimes(w http.ResponseWriter, r *http.Request) {
	// Get email from the session cookie
	cookie, err := r.Cookie("session")
	if err != nil {
		http.Error(w, "Unauthorized: No session cookie", http.StatusUnauthorized)
		return
	}

	sessionToken := cookie.Value

	// Look up email from session token
	var email string
	err = db.QueryRow("SELECT email FROM user_sessions WHERE token = $1", sessionToken).Scan(&email)
	if err != nil {
		http.Error(w, "Unauthorized: Invalid session", http.StatusUnauthorized)
		return
	}

	// Query the database for practice times
	rows, err := db.Query(`
        SELECT topic, time_spent
        FROM user_topic_timings
        WHERE email = $1
    `, email)
	if err != nil {
		log.Printf("Error querying practice times: %v", err)
		http.Error(w, "Failed to fetch practice times", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	// Prepare the response data
	type PracticeTime struct {
		Topic     string `json:"topic"`
		TimeSpent int    `json:"timeSpent"`
	}
	var practiceTimes []PracticeTime

	for rows.Next() {
		var topic string
		var timeSpent int
		if err := rows.Scan(&topic, &timeSpent); err != nil {
			log.Printf("Error scanning practice time row: %v", err)
			continue
		}
		practiceTimes = append(practiceTimes, PracticeTime{Topic: topic, TimeSpent: timeSpent})
	}

	// Return the practice times as JSON
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(practiceTimes); err != nil {
		log.Printf("Error encoding practice times to JSON: %v", err)
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
		return
	}
}

// -----------------------------
// Initialization Function
// -----------------------------

// initializeSat sets up the SAT module (creates tables, registers routes, and tests email connection).
// Note: This function assumes that the global variable "db" is declared in main.go.
func initializeSat(db *sql.DB) {
	// Debug environment variable for email password.
	password := os.Getenv("PASSWORD")
	if password == "" {
		log.Printf("WARNING: PASSWORD environment variable is empty")
	} else {
		log.Printf("Password environment variable is set (length: %d)", len(password))
	}

	// Create an email dialer.
	email = *gomail.NewDialer(
		"mail.privateemail.com", // SMTP Server
		587,                     // Port
		"contact@aquarc.org",    // Username
		password,                // Password from environment
	)
	email.TLSConfig = &tls.Config{
		ServerName:         "mail.privateemail.com",
		InsecureSkipVerify: true,
	}

	// Test the email connection.
	if err := email.DialAndSend(gomail.NewMessage()); err != nil {
		log.Printf("❌ Initial email connection test failed: %v", err)
	} else {
		log.Printf("✅ Initial email connection test successful")
	}

	// Create tables if they do not exist.
	_, err := db.Exec(`CREATE TABLE IF NOT EXISTS sat_questions (
		questionId TEXT PRIMARY KEY,
		id TEXT,
		test TEXT,
		category TEXT,
		domain TEXT,
		skill TEXT,
		difficulty TEXT,
		details TEXT,
		question TEXT,
		answer_choices TEXT,
		answer TEXT,
		rationale TEXT
	)`)
	if err != nil {
		log.Fatal(err)
	}

	_, err = db.Exec(`CREATE TABLE IF NOT EXISTS users (
		email TEXT PRIMARY KEY,
		username TEXT,
		password BYTEA,
		salt BYTEA,
		verified INTEGER DEFAULT 0
	)`)
	if err != nil {
		log.Fatal(err)
	}

	_, err = db.Exec(`CREATE TABLE IF NOT EXISTS verification_codes (
		code TEXT PRIMARY KEY,
		email TEXT REFERENCES users(email),
		timestamp BIGINT
	)`)
	if err != nil {
		log.Fatal(err)
	}

	// Create table for topic timings
	_, err = db.Exec(`CREATE TABLE IF NOT EXISTS user_topic_timings (
        email TEXT,
        topic TEXT,
        time_spent INTEGER DEFAULT 0,
        PRIMARY KEY (email, topic)
    )`)
	if err != nil {
		log.Fatal(err)
	}

	// Create table for user sessions if you don't have one
	_, err = db.Exec(`CREATE TABLE IF NOT EXISTS user_sessions (
	token TEXT PRIMARY KEY,
	email TEXT,
	expires_at TIMESTAMP
)`)
	if err != nil {
		log.Fatal(err)
	}

	// Register SAT-related HTTP handlers.
	http.HandleFunc("/sat/test", ServeForm)
	http.HandleFunc("/sat/find-questions", FindQuestionsHandler)
	http.HandleFunc("/sat/find-questions-v2", FindQuestionsHandlerv2)
	http.HandleFunc("/sat/register", register)
	http.HandleFunc("/sat/verifyRegistration", registerVerificationCode)
	http.HandleFunc("/sat/login", login)
	http.HandleFunc("/sat/record-topic-timing", recordTopicTiming)
	http.HandleFunc("/sat/get-practice-times", getPracticeTimes)

	// If you have legacy SAT initialization, call it here.
	initializeLegacySat(db)
}

// Dummy placeholder for initializeLegacySat.
func initializeLegacySatV2(db *sql.DB) {
	log.Println("initializeLegacySat called")
}
