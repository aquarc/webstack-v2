package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
    "strconv"
    "strings"
    "unicode"

	_ "github.com/joho/godotenv/autoload"
    "github.com/k3a/html2text"
    "github.com/lib/pq"
	_ "github.com/lib/pq"
)

// JSON struct to hold question details
type LegacyQuestionDetails struct {
	Domain        string `json:"domain"`
	Skill         string `json:"skill"`
	Difficulty    string `json:"difficulty"`
	Details       string `json:"details"`
	Question      string `json:"question"`
	AnswerChoices []string `json:"answerChoices"`
	Answer        string `json:"answer"`
	Rationale     string `json:"rationale"`
}

type LegacyAnswerChoice struct {
    QuestionId string `json:"id"`
    Answer     string `json:"content"`
}

const (
    LegacyInferences = iota + 'a'
    LegacyCentralIdeasAndDetails
    LegacyCommandOfEvidence
    LegacyWordsInContext
    LegacyTextStructureAndPurpose
    LegacyCrossTextConnections
    LegacyRhetoricalSynthesis
    LegacyTransitions
    LegacyBoundaries
    LegacyFormStructureAndSense

    LegacyDifficultyHard = iota + 'k'
    LegacyDifficultyMedium
    LegacyDifficultyEasy
)

// Function to parse the numeric prefix from the body
func parseNumericPrefix(body string) (int64, string, int64) {
    l := int64(len(body))
    var i int64
    for i < l && unicode.IsDigit(rune(body[i])) {
        i++
    }
    if i > 0 {
        num, err := strconv.ParseInt(body[:i], 10, 64)
        if err != nil {
            return 0, body, l // If parsing fails, return 0 and the original body
        }
        return num - 1, body[i:], l - i
    }
    return 0, body, l  // No numeric prefix found
}

func LegacyFindQuestionsHandler(w http.ResponseWriter, r *http.Request) {
    // parse data that looks like random english letters
    // "abdm" is a valid query

    // Extract the dynamic part of the URL (e.g., "asdm" from /legacy/sat-q/asdm)
    body := strings.TrimPrefix(r.URL.Path, "/legacy/sat-q/")

	// Check if the body is empty first
	if body == "" {
		http.Error(w, "Query is empty", http.StatusBadRequest)
		return
	}

    num, body, l := parseNumericPrefix(body)

    // two arrays we will add to
    difficulty := []string{}
    subdomain := []string{}

    // if one isn't selected, select all
    skillSelected := false
    difficultySelected := false

    // iterate over chars in the body
    for i := int64(0); i < int64(l); i++ {
        switch body[i] {
        case 'a':
            skillSelected = true
            // add "Inferences" to subdomain
            subdomain = append(subdomain, "Inferences")
        case 'b':
            skillSelected = true
            // add "Central Ideas and Details" to subdomain
            subdomain = append(subdomain, "Central Ideas and Details")
        case 'c':
            skillSelected = true
            // add "Command of Evidence" to subdomain
            subdomain = append(subdomain, "Command of Evidence")
        case 'd':
            skillSelected = true
            // add "Words in Context" to subdomain
            subdomain = append(subdomain, "Words in Context")
        case 'e':
            skillSelected = true
            // add "Text Structure and Purpose" to subdomain
            subdomain = append(subdomain, "Text Structure and Purpose")
        case 'f':
            skillSelected = true
            // add "Cross Text Connections" to subdomain
            subdomain = append(subdomain, "Cross Text Connections")
        case 'g':
            skillSelected = true
            // add "Rhetorical Synthesis" to subdomain
            subdomain = append(subdomain, "Rhetorical Synthesis")
        case 'h':
            skillSelected = true
            // add "Transitions" to subdomain
            subdomain = append(subdomain, "Transitions")
        case 'i':
            skillSelected = true
            // add "Boundaries" to subdomain
            subdomain = append(subdomain, "Boundaries")
        case 'j':
            skillSelected = true
            // add "Form Structure and Sense" to subdomain
            subdomain = append(subdomain, "Form Structure and Sense")


        case 'k':
            difficultySelected = true
            difficulty = append(difficulty, "Hard")
        case 'l':
            difficultySelected = true
            difficulty = append(difficulty, "Medium")
        case 'm':
            difficultySelected = true
            difficulty = append(difficulty, "Easy")
        default:
            http.Error(w, "Invalid request body", http.StatusBadRequest)
            return
        }
    }


    if !skillSelected {
        // if skill isn't selected select them all
        subdomain = append(subdomain, "Inferences")
        subdomain = append(subdomain, "Central Ideas and Details")
        subdomain = append(subdomain, "Command of Evidence")
        subdomain = append(subdomain, "Words in Context")
        subdomain = append(subdomain, "Text Structure and Purpose")
        subdomain = append(subdomain, "Cross Text Connections")
        subdomain = append(subdomain, "Rhetorical Synthesis")
        subdomain = append(subdomain, "Transitions")
        subdomain = append(subdomain, "Boundaries")
        subdomain = append(subdomain, "Form Structure and Sense")
    }

    if !difficultySelected {
        // if difficulty isn't selected, select all
        difficulty = append(difficulty, "Hard")
        difficulty = append(difficulty, "Medium")
        difficulty = append(difficulty, "Easy")
    }

	query := `
		SELECT domain, skill, difficulty, details,
			question, answer_choices, answer, rationale
        FROM sat_questions
        WHERE test = 'SAT'
        AND difficulty = ANY($1)
        AND skill = ANY($2)
        ORDER BY questionId
        OFFSET $3 LIMIT 10;
        `
        
	// query the db
	rows, err := db.Query(query, pq.Array(difficulty), pq.Array(subdomain), num)
    fmt.Println(difficulty, subdomain)
	if err != nil {
		// return http internal error
		http.Error(w, "Error querying: "+err.Error(), http.StatusInternalServerError)
		return
	}

	questions := []LegacyQuestionDetails{}

	// iterate oer the rows
	for rows.Next() {
		var question LegacyQuestionDetails
        var unparsedAnswerChoices string
		err = rows.Scan(
			&question.Domain, &question.Skill,
			&question.Difficulty, &question.Details, &question.Question,
			&unparsedAnswerChoices, &question.Answer, &question.Rationale,
		)
		if err != nil {
			// return http  400
			http.Error(w, "Error querying the database"+err.Error(), http.StatusBadRequest)
			return
		}
		// append the question
		// make the object json and append

		// convert to json
		// append the json
        question.Question = html2text.HTML2Text(question.Question)
        question.Rationale = html2text.HTML2Text(question.Rationale)
        question.Details = html2text.HTML2Text(question.Details)


        // parse the answer choice JSON into LegacyAnswerChoice
        answerChoices := []LegacyAnswerChoice{}
        json.Unmarshal([]byte(unparsedAnswerChoices), &answerChoices)
        for _, choice := range answerChoices {
            question.AnswerChoices = append(question.AnswerChoices, html2text.HTML2Text(choice.Answer))
        }

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


func initializeLegacySat(db *sql.DB) {
    // Create a new ServeMux
    http.Handle("/legacy/sat-q/", http.StripPrefix("/legacy/sat-q/", http.HandlerFunc(LegacyFindQuestionsHandler)))
}
