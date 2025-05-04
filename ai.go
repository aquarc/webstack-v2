package main

import (
	"crypto/tls"
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/google/generative-ai-go/genai"
	"github.com/lib/pq"
	"google.golang.org/api/option"

	"github.com/JohannesKaufmann/html-to-markdown/v2/converter"
	"github.com/JohannesKaufmann/html-to-markdown/v2/plugin/base"
	"github.com/JohannesKaufmann/html-to-markdown/v2/plugin/commonmark"

	_ "github.com/joho/godotenv/autoload"
	"gopkg.in/gomail.v2"
)

// Part struct to match the inner structure of history items in JSON
type Part struct {
	Parts []string `json:"parts"`
	Role  string   `json:"role"`
}

// ConversationRequest struct for JSON handling
type ConversationRequest struct {
	History    []Part `json:"history"` // Changed to []Part
	NewMessage string `json:"message"`
}

var conv = converter.NewConverter(
	converter.WithPlugins(
		base.NewBasePlugin(),
		commonmark.NewCommonmarkPlugin(),
	),
)

var client *genai.Client
var model *genai.GenerativeModel
var em *genai.EmbeddingModel
var systemPrompt = `
You are an expert SAT tutor and answer analyst with two core capabilities:

1. **Answer Evaluation Mode** (Triggered by answer comparison requests):
- Evaluate both correct and student answers
- Present strongest arguments FOR and AGAINST the student's answer
- Explain why the correct answer is superior with textual evidence

2. **Cognitive Analysis Mode** (Triggered by student mistake analysis requests):
- Analyze SAT questions with official rationales
- Identify cognitive biases in student thinking
- Generate multiple plausible thinking processes
- Output JSON array of thought pathways

Always maintain capacity for:
- Contextual follow-up questions
- Additional analysis layers on existing content
- Seamless switching between modes based on query type
`

// thinking handler utilities
type ThinkingConversationRequest struct {
	History []Part `json:"history"` // Changed to []Part
}

var thinkingModel *genai.GenerativeModel
var thinkingPrompt = `You are an expert SAT tutor analyzing a student's mistake on an SAT question. You are provided with:

1. The SAT question, including the text, answer choices, and the correct answer.
2. The official rationale for the correct answer and why the other choices are incorrect.
3. The student's chosen answer and their rationale for choosing that answer.
4. An argument contrasting the user's answer with the correct answer.

Consider potential cognitive biases (e.g., confirmation bias, anchoring bias, availability heuristic) that might have influenced the student's decision-making process. Develop multiple step-by-step thinking processes that incorporate these biases, leading to both the student's answer and the correct answer.

Output a JSON array of objects. Each object represents a distinct thinking process and whether it leads to the user's answer or the correct answer. Include as many plausible thinking processes as possible, even if they seem obvious.

Format:` +
	"```json" +
	`
[
    {
        "thinking_process": "[Here you will define a process step by step to get one of the answers]",
        "leads_to": "user" | "correct"
    },
    {
        "thinking_process": "[Here you will define another process step by step to get one of the answers]",
        "leads_to": "user" | "correct"
    },
    {
        "thinking_process": "[Include as many of these as possible!]",
        "leads_to": "user" | "correct"
    },
]
` +
	"```" +
	`
INCLUDE BETWEEN 3 AND 8 ITEMS. Be detailed, but be concise in your thinking processes.
`

// SimilarQuestionRequest struct for JSON handling
type SimilarQuestionRequest struct {
	Query   string   `json:"query"`
	Exclude []string `json:"exclude"`
}

func printResponse(resp *genai.GenerateContentResponse) string {
	var result string
	for _, cand := range resp.Candidates {
		if cand.Content != nil {
			for _, part := range cand.Content.Parts {
				result += fmt.Sprintf("%v", part)
			}
		}
	}
	return result
}

func logRequest(username string, r *http.Request, requestBody []byte, response interface{}, statusCode int) {
	// Convert request/response to JSON strings
	reqJSON := string(requestBody)
	resJSON, err := json.Marshal(response)
	if err != nil {
		resJSON = []byte(`{"error": "failed to marshal response for logging"}`)
	}

	// Insert into database
	_, err = db.Exec(`
        INSERT INTO request_logs 
        (username, endpoint, method, request_body, response_body, status_code)
        VALUES ($1, $2, $3, $4, $5, $6)`,
		username,
		r.URL.Path,
		r.Method,
		reqJSON,
		string(resJSON),
		statusCode,
	)

	if err != nil {
		log.Printf("Failed to log request: %v", err)
	}
}

func getLoggedIn(r *http.Request) string {
	// Check for session cookie
	cookie, err := r.Cookie("session")
	if err != nil {
		return "unknown"
	}

	// Validate session in database
	var email string
	var expiresAt time.Time
	err = db.QueryRow(`
        SELECT email, expires_at 
        FROM user_sessions 
        WHERE token = $1 AND expires_at > NOW()`,
		cookie.Value,
	).Scan(&email, &expiresAt)

	if err != nil {
		return "unknown"
	}

	// Get username from users table
	var username string
	err = db.QueryRow(`
        SELECT username 
        FROM users 
        WHERE email = $1`,
		email,
	).Scan(&username)

	if err != nil {
		return "unknown"
	}

	return username
}

func handleAIError(err string) {
	log.Println(err)
	emailMessage := gomail.NewMessage()
	emailMessage.SetHeader("From", "contact@aquarc.org")
	emailMessage.SetHeader("To", "rahejaom@outlook.com")
	emailMessage.SetHeader("Subject", "AI Cooked")
	emailMessage.SetBody("text/plain", fmt.Sprintf(`AI Error: %s`, err))
	emailMessage.SetHeader("Cc", "ronithneelam1429@gmail.com", "dhanya.velkur@gmail.com")

	dialer := gomail.NewDialer("mail.privateemail.com", 587, "contact@aquarc.org", os.Getenv("PASSWORD"))
	dialer.TLSConfig = &tls.Config{InsecureSkipVerify: true}

	if err := dialer.DialAndSend(emailMessage); err != nil {
		log.Printf("Error sending email: %v", err)
		return
	}
}

func AIRegularChatHandler(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	w.Header().Set("Content-Type", "application/json")

	body, _ := io.ReadAll(r.Body)
	defer r.Body.Close()

	username := getLoggedIn(r)
	fmt.Println(username)

	var convReq ConversationRequest
	var response interface{}
	var statusCode int = http.StatusOK

	// Defer logging to ensure it happens even on early returns
	defer func() {
		logRequest(username, r, body, response, statusCode)
	}()

	if err := json.Unmarshal(body, &convReq); err != nil {
		statusCode = http.StatusBadRequest
		response = map[string]string{"error": "Invalid JSON format"}
		json.NewEncoder(w).Encode(response)
		return
	}

	// Convert request history to genai.Content format
	historyContent := make([]*genai.Content, len(convReq.History))
	for i, part := range convReq.History {
		// Convert string parts to genai.Part format
		parts := make([]genai.Part, len(part.Parts))
		for j, p := range part.Parts {
			parts[j] = genai.Text(p)
		}

		// Create genai.Content with proper structure
		historyContent[i] = &genai.Content{
			Parts: parts,
			Role:  part.Role, // Direct string assignment
		}
	}

	// Create chat session with converted history
	cs := model.StartChat()
	cs.History = historyContent

	// Send message with context
	resp, err := cs.SendMessage(ctx, genai.Text(convReq.NewMessage))
	if err != nil {
		handleAIError(fmt.Sprintf("Error generating content: %v", err))
		http.Error(w, `{"error": "AI service unavailable"}`,
			http.StatusInternalServerError)
		return
	}

	// Get formatted response
	aiResponse := printResponse(resp)

	// When sending successful response
	response = map[string]interface{}{
		"response": aiResponse,
		"history":  cs.History,
	}
	json.NewEncoder(w).Encode(response)
}

func AIThinkingProcessHandler(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	w.Header().Set("Content-Type", "application/json")

	// Read body and store for logging
	body, _ := io.ReadAll(r.Body)
	defer r.Body.Close()

	// Get username and setup logging
	username := getLoggedIn(r)
	var response interface{}
	var statusCode int = http.StatusOK
	defer func() {
		logRequest(username, r, body, response, statusCode)
	}()

	var convReq ThinkingConversationRequest
	if err := json.Unmarshal(body, &convReq); err != nil {
		statusCode = http.StatusBadRequest
		response = map[string]string{"error": "Invalid JSON format"}
		json.NewEncoder(w).Encode(response)
		return
	}

	// Convert request history to genai.Content format
	historyContent := make([]*genai.Content, len(convReq.History))
	for i, part := range convReq.History {
		parts := make([]genai.Part, len(part.Parts))
		for j, p := range part.Parts {
			parts[j] = genai.Text(p)
		}
		historyContent[i] = &genai.Content{
			Parts: parts,
			Role:  part.Role,
		}
	}

	cs := thinkingModel.StartChat()
	cs.History = historyContent

	resp, err := cs.SendMessage(ctx, genai.Text(thinkingPrompt))
	if err != nil {
		handleAIError(fmt.Sprintf("Error generating content: %v", err))
		statusCode = http.StatusInternalServerError
		response = map[string]string{"error": "AI service unavailable"}
		json.NewEncoder(w).Encode(response)
		return
	}

	aiResponse := printResponse(resp)
	response = map[string]interface{}{
		"response": aiResponse,
		"history":  cs.History,
	}
	json.NewEncoder(w).Encode(response)
}

func FindSimilarQuestionsHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	ctx := r.Context()

	body, err := io.ReadAll(r.Body)
	defer r.Body.Close()

	username := getLoggedIn(r)
	var response interface{}
	var statusCode int = http.StatusOK
	defer func() {
		logRequest(username, r, body, response, statusCode)
	}()

	if err != nil {
		statusCode = http.StatusBadRequest
		response = map[string]string{"error": "Failed to read request body"}
		json.NewEncoder(w).Encode(response)
		return
	}

	var req SimilarQuestionRequest
	if err := json.Unmarshal(body, &req); err != nil {
		statusCode = http.StatusBadRequest
		response = map[string]string{"error": "Invalid JSON format"}
		json.NewEncoder(w).Encode(response)
		return
	}

	markdown := strings.ReplaceAll(req.Query, "<u>", "[UNDERLINE]")
	markdown = strings.ReplaceAll(markdown, "</u>", "[END]")

	markdown, err = conv.ConvertString(markdown)
	if err != nil {
		log.Printf("Error converting HTML to Markdown: %v", err)
		statusCode = http.StatusInternalServerError
		response = map[string]string{"error": "Failed to convert HTML to Markdown"}
		json.NewEncoder(w).Encode(response)
		return
	}

	resp, err := em.EmbedContent(ctx, genai.Text(markdown))
	if err != nil {
		handleAIError(fmt.Sprintf("Error generating embedding: %v", err))
		statusCode = http.StatusInternalServerError
		response = map[string]string{"error": "Failed to generate embedding"}
		json.NewEncoder(w).Encode(response)
		return
	}

	queryEmbedding := resp.Embedding.Values
	var vectorString string

	if len(queryEmbedding) > 0 {
		vectorString = fmt.Sprintf("[%f", queryEmbedding[0])
		for _, val := range queryEmbedding[1:] {
			vectorString += fmt.Sprintf(",%f", val)
		}
		vectorString += "]"
	} else {
		vectorString = "[]"
	}

	n := 10
	similarQuestions, err := findSimilarQuestions(vectorString, req.Exclude, n)
	if err != nil {
		log.Printf("Error finding questions: %v", err)
		statusCode = http.StatusInternalServerError
		response = map[string]string{"error": "Failed to find questions"}
		json.NewEncoder(w).Encode(response)
		return
	}

	response = map[string]interface{}{
		"similar_questions": similarQuestions,
	}
	json.NewEncoder(w).Encode(response)
}

func findSimilarQuestions(queryVector string, exclude []string, n int) ([]QuestionDetails, error) {
	query := `
        SELECT questionid, id, test, category, domain, skill, difficulty, details, question, answer_choices, answer, rationale
        FROM vec_sat_questions
        WHERE questionid NOT IN (SELECT unnest($3::text[])) 
        ORDER BY embedding <-> $1::vector
        LIMIT $2;`

	rows, err := db.Query(query, queryVector, n, pq.Array(exclude))
	if err != nil {
		return nil, fmt.Errorf("error querying similar questions: %w", err)
	}
	defer rows.Close()

	var similarQuestions []QuestionDetails
	for rows.Next() {
		var sq QuestionDetails
		if err := rows.Scan(&sq.QuestionID, &sq.ID, &sq.Test,
			&sq.Category, &sq.Domain, &sq.Skill,
			&sq.Difficulty, &sq.Details, &sq.Question,
			&sq.AnswerChoices, &sq.Answer, &sq.Rationale); err != nil {
			return nil, fmt.Errorf("error scanning similar question row: %w", err)
		}
		similarQuestions = append(similarQuestions, sq)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error during similar question rows iteration: %w", err)
	}

	return similarQuestions, nil
}

func initializeAI(db *sql.DB) {
	c, err := genai.NewClient(nil, option.WithAPIKey(os.Getenv("GOOGLE_API_KEY")))
	if err != nil {
		log.Fatal(err)
	}
	client = c

	model = client.GenerativeModel("gemini-2.0-flash")
	thinkingModel = client.GenerativeModel("gemini-2.0-flash")

	// Initialize model with system prompt
	model.SystemInstruction = &genai.Content{
		Parts: []genai.Part{
			genai.Text(systemPrompt),
		},
	}

	// Initialize thinking model with system prompt
	thinkingModel.SystemInstruction = &genai.Content{
		Parts: []genai.Part{
			genai.Text(systemPrompt),
		},
	}

	thinkingModel.ResponseMIMEType = "application/json"

	// Define the response schema correctly
	thinkingModel.ResponseSchema = &genai.Schema{
		Type: genai.TypeArray,
		Items: &genai.Schema{
			Type: genai.TypeObject, // Explicitly use TypeObject
			Properties: map[string]*genai.Schema{
				"thinking_process": {
					Type: genai.TypeString,
				},
				"leads_to": {
					Type: genai.TypeString,
					Enum: []string{"user", "correct"},
				},
			},
			Required: []string{"thinking_process", "leads_to"}, // Specify required fields
		},
		/* don't work for some reason */
		//      MinItems: 3,
		//		MaxItems: 8,
	}

	em = client.EmbeddingModel("text-embedding-004")

	// Create request logs table
	_, err = db.Exec(`CREATE TABLE IF NOT EXISTS request_logs (
        id SERIAL PRIMARY KEY,
        username TEXT,
        endpoint TEXT,
        method TEXT,
        request_body TEXT,
        response_body TEXT,
        status_code INTEGER,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`)
	if err != nil {
		log.Fatal(err)
	}

	http.HandleFunc("/ai/chat", AIRegularChatHandler)
	http.HandleFunc("/ai/think", AIThinkingProcessHandler)
	http.HandleFunc("/ai/similarquestions", FindSimilarQuestionsHandler)
}
