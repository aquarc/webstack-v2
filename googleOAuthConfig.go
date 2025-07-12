package main

import (
    "context"
    "database/sql"
    "encoding/json"
    "log"
    "net/http"
    "os"
    "time"

    firebase "firebase.google.com/go"
    "firebase.google.com/go/auth"
    "google.golang.org/api/option"
)

// Firebase app instance
var firebaseApp *firebase.App
var authClient *auth.Client

// Initialize Firebase
func initializeFirebase() {
    ctx := context.Background()
    
    // Get service account JSON from environment variable
    serviceAccount := os.Getenv("FIREBASE_SERVICE_ACCOUNT")
    if serviceAccount == "" {
        log.Fatal("FIREBASE_SERVICE_ACCOUNT environment variable not set")
    }

    // Initialize with credentials
    opt := option.WithCredentialsJSON([]byte(serviceAccount))
    
    var err error
    firebaseApp, err = firebase.NewApp(ctx, nil, opt)
    if err != nil {
        log.Fatalf("error initializing Firebase app: %v\n", err)
    }

    authClient, err = firebaseApp.Auth(ctx)
    if err != nil {
        log.Fatalf("error getting Auth client: %v\n", err)
    }

    log.Println("✅ Firebase initialized successfully")
}

// Handler for Firebase authentication callback
func firebaseAuthCallback(w http.ResponseWriter, r *http.Request) {
    if r.Method != "POST" {
        http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
        return
    }

    var data struct {
        IDToken string `json:"idToken"`
    }
    if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
        http.Error(w, "Invalid request body", http.StatusBadRequest)
        return
    }

    ctx := context.Background()
    
    // Verify the ID token
    token, err := authClient.VerifyIDToken(ctx, data.IDToken)
    if err != nil {
        log.Printf("Error verifying ID token: %v\n", err)
        http.Error(w, "Invalid ID token", http.StatusUnauthorized)
        return
    }

    // Get user info from Firebase
    user, err := authClient.GetUser(ctx, token.UID)
    if err != nil {
        log.Printf("Error getting user from Firebase: %v\n", err)
        http.Error(w, "Failed to get user information", http.StatusInternalServerError)
        return
    }

    // Check if email is verified
    if !user.EmailVerified {
        http.Error(w, "Email not verified", http.StatusBadRequest)
        return
    }

    // Check if user exists in database
    var existingEmail string
    var username string
    err = db.QueryRow("SELECT email, username FROM users WHERE email = $1", user.Email).Scan(&existingEmail, &username)

    if err == sql.ErrNoRows {
        // User doesn't exist, create new user
        username = user.DisplayName
        if username == "" {
            username = "User" // Default username
        }

        // Insert new user (no password needed for Firebase users)
        _, err = db.Exec(`
            INSERT INTO users (email, username, password, salt, verified, oauth_provider, oauth_id) 
            VALUES ($1, $2, '', '', 1, 'firebase', $3)`,
            user.Email,
            username,
            user.UID,
        )

        if err != nil {
            log.Printf("Failed to create Firebase user: %v", err)
            http.Error(w, "Failed to create user account", http.StatusInternalServerError)
            return
        }
        log.Printf("✅ Created new Firebase user: %s", user.Email)
    } else if err != nil {
        log.Printf("Database error checking user: %v", err)
        http.Error(w, "Database error", http.StatusInternalServerError)
        return
    } else {
        // User exists, update Firebase info if needed
        _, err = db.Exec(`
            UPDATE users 
            SET oauth_provider = 'firebase', oauth_id = $1, verified = 1 
            WHERE email = $2`,
            user.UID,
            user.Email,
        )
        if err != nil {
            log.Printf("Failed to update Firebase info: %v", err)
            // Continue anyway, this is not critical
        }
        log.Printf("✅ Existing user logged in via Firebase: %s", user.Email)
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
        sessionToken, user.Email, expiresAt,
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

    // In the firebaseAuthCallback function, after successful authentication:
    w.WriteHeader(http.StatusOK)
    json.NewEncoder(w).Encode(map[string]string{
        "status":   "success",
        "email":    user.Email,
        "username": username, // This was set earlier in your code
    })
}

// Register Firebase routes
func registerFirebaseRoutes() {
    http.HandleFunc("/auth/firebase/callback", firebaseAuthCallback)
    log.Println("✅ Firebase routes registered")
}