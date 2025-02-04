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
	_ "github.com/lib/pq"
	"gopkg.in/gomail.v2"
)

// JSON struct to hold question details
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

type SATQuestion struct {
	Test       string   `json:"test"`
	Difficulty []string `json:"difficulty"`
	Subdomain  []string `json:"subdomain"`
}

type Credentials struct {
	Email    string `json:"email"`
	Username string `json:"username"`
	Password string `json:"password"`
}

type Verification struct {
	Email string `json:"email"`
	Code  string `json:"code"`
}

var email gomail.Dialer

func indexSat(w http.ResponseWriter, r *http.Request) {
	// load index.html from static/
	http.ServeFile(w, r, "./frontend/sat/pages/practice.html")
}

func findQuestions(w http.ResponseWriter, r *http.Request, test, category, domain, skill, difficulty string) {
	var err error

	// Build the query with filters
	query := `
        SELECT questionId
        FROM sat_questions
        WHERE test = ?
        AND category = ?
        AND domain = ?
        AND skill = ?
        AND difficulty = ?`

	// Execute the query with user inputs as filters
	rows, err := db.Query(query, test, category, domain, skill, difficulty)
	if err != nil {
		http.Error(w, "Failed to query database", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	// Collect matching question IDs
	var questionId string
	matchingQuestions := []string{}
	for rows.Next() {
		err := rows.Scan(&questionId)
		if err != nil {
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

// viewQuestionDetails handles displaying all information for each questionId in matchingQuestions

func viewQuestionDetails(w http.ResponseWriter, matchingQuestions []string) {
	var err error

	// Slice to store details of all matching questions
	var questions []QuestionDetails

	for _, questionId := range matchingQuestions {

		queryDetails := `
			SELECT questionId, id, test, category, domain, skill, difficulty, details,
				question, answer_choices, answer, rationale
			FROM sat_questions
			WHERE questionId = ?`

		// Stores question details
		var question QuestionDetails

		// Execute the query and scan the result into the struct
		err = db.QueryRow(queryDetails, questionId).Scan(
			&question.QuestionID, &question.ID, &question.Test, &question.Category, &question.Domain,
			&question.Skill, &question.Difficulty, &question.Details, &question.Question,
			&question.AnswerChoices, &question.Answer, &question.Rationale,
		)

		if err != nil {
			if err == sql.ErrNoRows {
				log.Printf("No question found with ID: %s", questionId)
				continue
			} else {
				log.Printf("Error querying the database for questionId %s: %v", questionId, err)
				http.Error(w, "Error querying the database", http.StatusInternalServerError)
				return
			}
		}

		// Append the question details to the slice
		questions = append(questions, question)
	}

	// Convert the slice of questions to a JSON string
	jsonData, err := json.Marshal(questions)
	if err != nil {
		log.Printf("Error converting questions to JSON: %v", err)
		http.Error(w, "Error generating JSON response", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(jsonData)
}

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

// Handle form submission and call findQuestions
func FindQuestionsHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method == "POST" {
		// Extract form values
		test := r.FormValue("test")
		category := r.FormValue("category")
		domain := r.FormValue("domain")
		skill := r.FormValue("skill")
		difficulty := r.FormValue("difficulty")

		// Call the findQuestions function with the provided inputs
		findQuestions(w, r, test, category, domain, skill, difficulty)
	} else {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
	}
}

func FindQuestionsHandlerv2(w http.ResponseWriter, r *http.Request) {
	// parse JSON in the form of
	// {
	//      "test": "SAT",
	//      "difficulty": ["Medium", "Hard"],
	//      "subdomains": ["Information and Ideas", "Algebra"]
	// }

	// parse json
	var data SATQuestion

	// Check if the body is empty first
	if r.Body == nil || r.ContentLength == 0 {
		http.Error(w, "Request body is empty", http.StatusBadRequest)
		return
	}

	err := json.NewDecoder(r.Body).Decode(&data)
	if err != nil {
		// return 400 bad request
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
	// query the db
	difficulty := pq.Array(data.Difficulty)
	subdomain := pq.Array(data.Subdomain)
	rows, err := db.Query(query, data.Test, difficulty, subdomain)
	if err != nil {
		// return http internal error
		http.Error(w, "Error querying: "+err.Error(), http.StatusInternalServerError)
		return
	}

	questions := []QuestionDetails{}

	// iterate oer the rows
	for rows.Next() {
		var question QuestionDetails
		err = rows.Scan(&question.QuestionID, &question.ID, &question.Test,
			&question.Category, &question.Domain, &question.Skill,
			&question.Difficulty, &question.Details, &question.Question,
			&question.AnswerChoices, &question.Answer, &question.Rationale,
		)
		if err != nil {
			// return http internal error
			http.Error(w, "Error querying the database"+err.Error(), http.StatusInternalServerError)
			return
		}
		// append the question
		// make the object json and append

		// convert to json
		// append the json
		questions = append(questions, question)
	}

	// return the json
	jsonData, err := json.Marshal(questions)
	if err != nil {
		log.Printf("Error converting questions to JSON: %v", err)
		http.Error(w, "Error generating JSON response", http.StatusInternalServerError)
		return
	}

	defer rows.Close()

	w.Header().Set("Content-Type", "application/json")
	w.Write(jsonData)
}

func register(w http.ResponseWriter, r *http.Request) {
    var data Credentials
    err := json.NewDecoder(r.Body).Decode(&data)
    if err != nil {
        log.Printf("Error decoding request body: %v", err)
        http.Error(w, "Invalid request body ", http.StatusBadRequest)
        return
    }

    var existingEmail string
    err = db.QueryRow("SELECT email FROM users WHERE email = $1", data.Email).Scan(&existingEmail)
    if err != sql.ErrNoRows {
        if err == nil {
            http.Error(w, "Email already registered", http.StatusConflict)
        } else {
            log.Printf("Database error checking email: %v", err)
            http.Error(w, "Internal server error", http.StatusInternalServerError)
        }
        return
    }

    // Generate salt
    generatedSalt := make([]byte, 16)
    _, err = rand.Read(generatedSalt)
    if err != nil {
        log.Printf("Error generating salt: %v", err)
        http.Error(w, "Internal Error", http.StatusInternalServerError)
        return
    }
    
    // Create new salt + password bytes
    saltedPassword := make([]byte, len(generatedSalt)+len(data.Password))
    copy(saltedPassword, generatedSalt)
    copy(saltedPassword[len(generatedSalt):], []byte(data.Password))
    
    // Hash the password
    hashedPassword := sha512.Sum512(saltedPassword)
    
    // Convert binary data to hex strings for storage
    hashedPasswordHex := fmt.Sprintf("%x", hashedPassword[:])
    saltHex := fmt.Sprintf("%x", generatedSalt)

    // Insert into database using hex strings
    _, err = db.Exec(`
        INSERT INTO users (email, username, password, salt, verified) 
        VALUES ($1, $2, $3, $4, $5)`,
        data.Email, 
        data.Username, 
        hashedPasswordHex,  // Store as hex string
        saltHex,           // Store as hex string
        0,
    )

    if err != nil {
        log.Printf("Database error during insert: %v", err)
        http.Error(w, "Error creating user: "+err.Error(), http.StatusInternalServerError)
        return
    }

    // Now handle email verification
    randomCode, err := rand.Int(rand.Reader, big.NewInt(1e7))
    if err != nil {
        log.Printf("Error generating verification code: %v", err)
        http.Error(w, "Internal Server Error", http.StatusInternalServerError)
        return
    }
    randomCodeString := fmt.Sprintf("%07d", randomCode.Int64())

    // Store verification code
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

    // Send verification email
    emailMessage := gomail.NewMessage()
    emailMessage.SetHeader("From", "contact@aquarc.org")
    emailMessage.SetHeader("To", data.Email)
    emailMessage.SetHeader("Subject", "Aquarc Verification Code")
    emailMessage.SetBody("text/plain",
        fmt.Sprintf(`Hi %s,
Thank you so much for supporting aquarc! Your verification code is: %s

Feel free to reach out to this email if you need help in your high school journey.

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

    log.Printf("✅ Successfully registered user and sent verification code to: %s", data.Email)
    w.WriteHeader(http.StatusOK)
    w.Write([]byte("User registered successfully. Please check your email for verification code."))
}
func registerVerificationCode(w http.ResponseWriter, r *http.Request) {
	var data Verification
	err := json.NewDecoder(r.Body).Decode(&data)
	if err != nil {
		http.Error(w, "Invalid request body ", http.StatusBadRequest)
		return
	}

	var code string
	var timestamp int64
	// get the most recent verification code for the email
	err = db.QueryRow("SELECT code, timestamp FROM verification_codes WHERE email = $1 ORDER BY timestamp DESC LIMIT 1",
		data.Email).Scan(&code, &timestamp)
	if err != nil {
		http.Error(w, "Email not currently registering", http.StatusBadRequest)
		return
	}

	if code != data.Code {
		http.Error(w, "Verification Code does not match", http.StatusForbidden)
		return
	}

	// a code greater than 10 minutes old
	if time.Now().Unix()-timestamp > 10*60 {
		http.Error(w, "Verification Code has Expired", http.StatusNotFound)
		return
	}

	_, err = db.Exec("UPDATE users SET verified = 1 WHERE email = $1", data.Email)

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("User verified successfully"))
}

func login(w http.ResponseWriter, r *http.Request) {
    var data Credentials
    err := json.NewDecoder(r.Body).Decode(&data)
    if err != nil {
        http.Error(w, "Invalid request body ", http.StatusBadRequest)
        return
    }

    var storedPasswordHex string
    var storedSaltHex string
    var verified int

    err = db.QueryRow(`
        SELECT password, salt, verified 
        FROM users 
        WHERE email = $1`, data.Email).Scan(&storedPasswordHex, &storedSaltHex, &verified)

    if err != nil {
        if err == sql.ErrNoRows {
            http.Error(w, "User Does Not Exist", http.StatusBadRequest)
        } else {
            log.Printf("Database error: %v", err)
            http.Error(w, "Internal server error", http.StatusInternalServerError)
        }
        return
    }

    // Convert hex strings back to bytes
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

    // Create new salt + password bytes
    saltedPassword := make([]byte, len(storedSaltBytes)+len(data.Password))
    copy(saltedPassword, storedSaltBytes)
    copy(saltedPassword[len(storedSaltBytes):], []byte(data.Password))
    
    // Hash the password
    hashedPassword := sha512.Sum512(saltedPassword)

    // Compare using a constant-time comparison
    if !bytes.Equal(storedPasswordBytes, hashedPassword[:]) {
        http.Error(w, "Password does not match", http.StatusForbidden)
        return
    }

    w.WriteHeader(http.StatusOK)
    w.Write([]byte("User logged in successfully"))
}

func initializeSat(db *sql.DB) {
	// Debug environment variables
	password := os.Getenv("PASSWORD")
	if password == "" {
		log.Printf("WARNING: PASSWORD environment variable is empty")
	} else {
		log.Printf("Password environment variable is set (length: %d)", len(password))
	}

	// Try creating dialer with explicit configuration
	email = *gomail.NewDialer(
		"mail.privateemail.com", // SMTP Server
		587,                     // Port
		"contact@aquarc.org",    // Username
		password,                // Password from environment
	)

	// Configure TLS with more detailed settings
	email.TLSConfig = &tls.Config{
		ServerName:         "mail.privateemail.com",
		InsecureSkipVerify: true,
	}

	// Test the email connection immediately
	// TODO: This will be useful when we automatically login to dashboard
	if err := email.DialAndSend(gomail.NewMessage()); err != nil {
		log.Printf("❌ Initial email connection test failed: %v", err)
	} else {
		log.Printf("✅ Initial email connection test successful")
	}
	// create table if not exists
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
		email TEXT,
		timestamp BIGINT
	)`)

	http.HandleFunc("/sat/test", ServeForm)
	http.HandleFunc("/sat/find-questions", FindQuestionsHandler)
	http.HandleFunc("/sat/find-questions-v2", FindQuestionsHandlerv2)
	http.HandleFunc("/sat/register", register)
	http.HandleFunc("/sat/verifyRegistration", registerVerificationCode)
	http.HandleFunc("/sat/login", login)
}
