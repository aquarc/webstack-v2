package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"

	_ "github.com/mattn/go-sqlite3"
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
    Test string `json:"test"`
    Difficulty []string `json:"difficulty"`
    Subdomain []string `json:"subdomain"`
}

type Register struct {
    Email string `json:"email"`
    Password string `json:"password"`
}

func indexSat(w http.ResponseWriter, r *http.Request) {
	// load index.html from static/
	http.ServeFile(w, r, "./static/sat/pages/practice.html")
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
        WHERE test = ?
        `
    args := []interface{}{}

    args = append(args, data.Test)

    query += " AND difficulty IN ("

    difficultyPlaceholders := []string{}
    for _, item := range data.Difficulty {
        difficultyPlaceholders = append(difficultyPlaceholders, "?")
        args = append(args, item)

    }

    query += strings.Join(difficultyPlaceholders, ",") + ") AND skill IN ("

    subdomainPlaceholders := []string{}
    for _, item := range data.Subdomain {
        subdomainPlaceholders = append(subdomainPlaceholders, "?")
        args = append(args, item)
    } 

    query += strings.Join(subdomainPlaceholders, ",") + ")"
    
    // query the db
    rows, err := db.Query(query, args...)
    if err != nil {
        // return http internal error
        http.Error(w, "Error querying: " + err.Error(), http.StatusInternalServerError)
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
            http.Error(w, "Error querying the database" + err.Error(), http.StatusInternalServerError)
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
    var data Register
    err := json.NewDecoder(r.Body).Decode(&data)
    if err != nil {
        http.Error(w, "Invalid request body", http.StatusBadRequest)
        return
    }

    // TODO: hash password
    
    // insert into database
    _, err = db.Exec("INSERT INTO sat_users (username, password) VALUES (?, ?)", data.Email, data.Password)
    if err != nil {
        http.Error(w, "Error inserting into database: " + err.Error(), http.StatusInternalServerError)
        return
    }

    w.WriteHeader(http.StatusOK)
    w.Write([]byte("User registered successfully"))
}


func initializeSat(db *sql.DB) {
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

    _, err = db.Exec(`CREATE TABLE IF NOT EXISTS sat_users (
        username TEXT PRIMARY KEY,
        password TEXT
    )`)
    if err != nil {
        log.Fatal(err)
    }

    http.HandleFunc("/sat", indexSat)
	http.HandleFunc("/sat/test", ServeForm)
	http.HandleFunc("/sat/find-questions", FindQuestionsHandler)
    http.HandleFunc("/sat/find-questions-v2", FindQuestionsHandlerv2)
    http.HandleFunc("/sat/register", register)
}
