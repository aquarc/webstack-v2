package main

import (
	"context"
	"crypto/rand"
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"time"

	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
)

// Google OAuth configuration
var googleOAuthConfig *oauth2.Config

// Google user info structure
type GoogleUserInfo struct {
	ID            string `json:"id"`
	Email         string `json:"email"`
	VerifiedEmail bool   `json:"verified_email"`
	Name          string `json:"name"`
	GivenName     string `json:"given_name"`
	FamilyName    string `json:"family_name"`
	Picture       string `json:"picture"`
}

// OAuth state store (in production, use Redis or database)
var oauthStateStore = make(map[string]time.Time)

// Generate random state string for OAuth security
func generateOAuthState() string {
	b := make([]byte, 32)
	rand.Read(b)
	return fmt.Sprintf("%x", b)
}

// Clean expired OAuth states
func cleanupOAuthStates() {
	for state, timestamp := range oauthStateStore {
		if time.Since(timestamp) > 10*time.Minute {
			delete(oauthStateStore, state)
		}
	}
}

// Initialize Google OAuth configuration
func initializeGoogleOAuth() {
	googleOAuthConfig = &oauth2.Config{
		ClientID:     os.Getenv("GOOGLE_CLIENT_ID"),
		ClientSecret: os.Getenv("GOOGLE_CLIENT_SECRET"),
		RedirectURL:  os.Getenv("GOOGLE_REDIRECT_URL"), // e.g., "https://yourdomain.com/auth/google/callback"
		Scopes: []string{
			"https://www.googleapis.com/auth/userinfo.email",
			"https://www.googleapis.com/auth/userinfo.profile",
		},
		Endpoint: google.Endpoint,
	}

	// Validate environment variables
	if googleOAuthConfig.ClientID == "" || googleOAuthConfig.ClientSecret == "" {
		log.Fatal("GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set")
	}

	if googleOAuthConfig.RedirectURL == "" {
		log.Println("WARNING: GOOGLE_REDIRECT_URL not set, using default")
		googleOAuthConfig.RedirectURL = "http://localhost:8080/auth/google/callback"
	}

	log.Println("✅ Google OAuth initialized successfully")
}

// Handler to initiate Google OAuth flow
func googleOAuthLogin(w http.ResponseWriter, r *http.Request) {
	// Clean up expired states
	cleanupOAuthStates()

	// Generate and store state
	state := generateOAuthState()
	oauthStateStore[state] = time.Now()

	// Get authorization URL
	url := googleOAuthConfig.AuthCodeURL(state, oauth2.AccessTypeOffline)

	// Redirect to Google
	http.Redirect(w, r, url, http.StatusTemporaryRedirect)
}

// Handler for Google OAuth callback
// Updated googleOAuthCallback function with proper redirect handling
func googleOAuthCallback(w http.ResponseWriter, r *http.Request) {
	// Get state and code from query parameters
	state := r.URL.Query().Get("state")
	code := r.URL.Query().Get("code")
	log.Println("OAuth callback received")
	log.Printf("Request URL: %s", r.URL.String())
	// Validate state
	if timestamp, exists := oauthStateStore[state]; !exists || time.Since(timestamp) > 10*time.Minute {
		http.Error(w, "Invalid or expired state parameter", http.StatusBadRequest)
		return
	}

	// Remove used state
	delete(oauthStateStore, state)

	// Handle error from Google
	if errorParam := r.URL.Query().Get("error"); errorParam != "" {
		http.Error(w, "OAuth error: "+errorParam, http.StatusBadRequest)
		return
	}

	// Exchange code for token
	ctx := context.Background()
	token, err := googleOAuthConfig.Exchange(ctx, code)
	if err != nil {
		log.Printf("Failed to exchange code for token: %v", err)
		http.Error(w, "Failed to exchange authorization code", http.StatusInternalServerError)
		return
	}

	// Get user info from Google
	client := googleOAuthConfig.Client(ctx, token)
	userInfoResp, err := client.Get("https://www.googleapis.com/oauth2/v2/userinfo")
	if err != nil {
		log.Printf("Failed to get user info: %v", err)
		http.Error(w, "Failed to get user information", http.StatusInternalServerError)
		return
	}
	defer userInfoResp.Body.Close()

	userInfoBytes, err := io.ReadAll(userInfoResp.Body)
	if err != nil {
		log.Printf("Failed to read user info response: %v", err)
		http.Error(w, "Failed to read user information", http.StatusInternalServerError)
		return
	}

	var googleUser GoogleUserInfo
	if err := json.Unmarshal(userInfoBytes, &googleUser); err != nil {
		log.Printf("Failed to parse user info: %v", err)
		http.Error(w, "Failed to parse user information", http.StatusInternalServerError)
		return
	}

	// Check if email is verified
	if !googleUser.VerifiedEmail {
		http.Error(w, "Google account email is not verified", http.StatusBadRequest)
		return
	}

	// Check if user exists in database
	var existingEmail string
	var username string
	err = db.QueryRow("SELECT email, username FROM users WHERE email = $1", googleUser.Email).Scan(&existingEmail, &username)

	if err == sql.ErrNoRows {
		// User doesn't exist, create new user
		username = googleUser.Name
		if username == "" {
			username = googleUser.GivenName
		}

		// Insert new user (no password needed for OAuth users)
		_, err = db.Exec(`
			INSERT INTO users (email, username, password, salt, verified, oauth_provider, oauth_id) 
			VALUES ($1, $2, '', '', 1, 'google', $3)`,
			googleUser.Email,
			username,
			googleUser.ID,
		)
		log.Printf("Google user info: %+v", googleUser)

		if err != nil {
			log.Printf("Failed to create OAuth user: %v", err)
			http.Error(w, "Failed to create user account", http.StatusInternalServerError)
			return
		}
		log.Printf("✅ Created new OAuth user: %s", googleUser.Email)
	} else if err != nil {
		log.Printf("Database error checking user: %v", err)
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	} else {
		// User exists, update OAuth info if needed
		_, err = db.Exec(`
			UPDATE users 
			SET oauth_provider = 'google', oauth_id = $1, verified = 1 
			WHERE email = $2`,
			googleUser.ID,
			googleUser.Email,
		)
		if err != nil {
			log.Printf("Failed to update OAuth info: %v", err)
			// Continue anyway, this is not critical
		}
		log.Printf("✅ Existing user logged in via OAuth: %s", googleUser.Email)
	}

	// Create session token
	sessionToken, err := generateSessionToken()
	if err != nil {
		log.Printf("Error generating session token: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	// Store session in database
	expiresAt := time.Now().Add(7 * 24 * time.Hour) // 7 days
	_, err = db.Exec(
		"INSERT INTO user_sessions (token, email, expires_at) VALUES ($1, $2, $3)",
		sessionToken, googleUser.Email, expiresAt,
	)
	if err != nil {
		log.Printf("Error storing session: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	// Set session cookies
	http.SetCookie(w, &http.Cookie{
		Name:     "session",
		Value:    sessionToken,
		Path:     "/",
		HttpOnly: true,
		Secure:   true, // Set to true in production with HTTPS
		SameSite: http.SameSiteStrictMode,
		MaxAge:   86400 * 7, // 7 days
	})

	http.SetCookie(w, &http.Cookie{
		Name:     "username",
		Value:    username,
		Path:     "/",
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteStrictMode,
		MaxAge:   86400 * 7, // 7 days
	})

	// FIXED: Redirect to main landing page instead of /sat
	frontendURL := os.Getenv("FRONTEND_URL")
	if frontendURL == "" {
		frontendURL = "http://localhost:3000" // Default for development
	}

	// Redirect options - choose the one that matches your app structure:

	// Option 1: Redirect to root/landing page
	http.Redirect(w, r, frontendURL+"/?auth=success", http.StatusTemporaryRedirect)

	// Option 2: Redirect to a dashboard page
	// http.Redirect(w, r, frontendURL+"/dashboard?auth=success", http.StatusTemporaryRedirect)

	// Option 3: Redirect to wherever the user was trying to go (if you store that info)
	// redirectTo := r.URL.Query().Get("redirect_to")
	// if redirectTo == "" {
	//     redirectTo = "/"
	// }
	// http.Redirect(w, r, frontendURL+redirectTo+"?auth=success", http.StatusTemporaryRedirect)
}

// Update your initializeSat function to include OAuth routes and table modifications
func initializeGoogleOAuthTables(db *sql.DB) {
	// Add OAuth columns to existing users table
	_, err := db.Exec(`
		ALTER TABLE users 
		ADD COLUMN IF NOT EXISTS oauth_provider TEXT,
		ADD COLUMN IF NOT EXISTS oauth_id TEXT
	`)
	if err != nil {
		log.Printf("Note: Could not add OAuth columns (may already exist): %v", err)
	}

	// Create index for OAuth lookups
	_, err = db.Exec(`
		CREATE INDEX IF NOT EXISTS idx_users_oauth 
		ON users(oauth_provider, oauth_id)
	`)
	if err != nil {
		log.Printf("Could not create OAuth index: %v", err)
	}

	log.Println("✅ OAuth database tables initialized")
}

// Add these routes to your initializeSat function
func registerOAuthRoutes() {
	http.HandleFunc("/auth/google/login", googleOAuthLogin)
	http.HandleFunc("/auth/google/callback", googleOAuthCallback) // This handles the callback
	log.Println("✅ OAuth routes registered")
}
