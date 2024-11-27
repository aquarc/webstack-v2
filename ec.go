package main

import (
	"bytes"
	"database/sql"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"net/url"
	"strings"

	_ "github.com/mattn/go-sqlite3"
)

func indexEc(w http.ResponseWriter, r *http.Request) {
	// load index.html from static/
	http.ServeFile(w, r, "./static/ec/index.html")
}

/* scholarships */

func difficultyScholarships(w http.ResponseWriter, r *http.Request) {
	// check if grades are set in the request
	err := r.ParseForm()
	if err != nil {
		// redirect back to scholarship.html
		http.Redirect(w, r, "/static/ec/grades-scholarships.html", http.StatusFound)
		return
	}

	if r.Form["grades"] == nil {
		// redirect back to scholarship.html
		http.Redirect(w, r, "/static/ec/grades-scholarships.html", http.StatusFound)
		return
	}

	// load difficulty-scholarships.html from static/
	content, err := ioutil.ReadFile("./static/ec/difficulty-scholarships.html")
	if err != nil {
		log.Fatal(err)
	}

	/* replace the first instance of '{}' with the html */

	// construct the html
	htmlToInsert := ""

	for i := 0; i < len(r.Form["grades"]); i++ {
		htmlToInsert +=
			fmt.Sprintf("<input type='hidden' name='grades' value='%s'>",
				r.Form["grades"][i])
	}

	content = bytes.Replace(content, []byte("{}"), []byte(htmlToInsert), 1)
	fmt.Fprintf(w, string(content))
}

func resultsScholarship(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/html; charset=utf-8")

	// check if grades are set in the request
	err := r.ParseForm()
	if err != nil {
		http.Redirect(w, r, "/static/ec/grades-scholarships.html", http.StatusFound)
		return
	}

	// check if difficulty is set in the request
	if r.Form["difficulty"] == nil {
		http.Redirect(w, r, "/static/ec/difficulty-scholarships.html", http.StatusFound)
		return
	}

	// dynamically construct the query

	// read the form data from the request
	subjects := r.Form["difficulty"]
	grades := r.Form["grades"]

	// Create placeholders for the 'IN' clause
	subjectPlaceholders := make([]string, len(subjects))
	for i := range subjects {
		subjectPlaceholders[i] = "?" // Each ? is a placeholder
	}

	gradePlaceholder := make([]string, len(grades))
	for i := range grades {
		gradePlaceholder[i] = " (startGrade <= ? AND ? <= endGrade) "
	}

	query := "SELECT * FROM scholarships WHERE " +
		" category IN (" + strings.Join(subjectPlaceholders, ",") + ") AND (" +
		strings.Join(gradePlaceholder, " OR ") +
		" OR startGrade IS NULL OR endGrade IS NULL)" +
		" ORDER BY name ASC;"

	// add the args
	args := []interface{}{}
	for _, difficulty := range r.Form["difficulty"] {
		args = append(args, difficulty)
	}

	for _, grade := range r.Form["grades"] {
		args = append(args, grade, grade)
	}

	// execute the query
	rows, err := db.Query(query, args...)
	if err != nil {
		log.Fatal(err)
	}

	htmlToInsert := ""
	for rows.Next() {
		var name string
		var startGrade int
		var endGrade int
		var amount string
		var deadline sql.NullString 
		var link string
		var notes string
		var category string

		err := rows.Scan(&name, &startGrade, &endGrade,
			&amount, &deadline, &link, &notes, &category)
		if err != nil {
			log.Print("error scanning rows: ", err)
		}

		htmlToInsert += `
            <button onclick="launchModal('` + name + `')" class="program-cards2">
              <div id="` + name + `"
                data-link="` + link + `"
                data-amount="` + amount + `"
                data-grades="` + fmt.Sprintf("%d-%d", startGrade, endGrade) + `"`

        if deadline.Valid {
            htmlToInsert += `data-deadline="` + deadline.String + `"`
        }

        htmlToInsert += `
                data-category="` + category + `"
                data-notes="` + notes + `">
                <div class="program-name">` + name + `</div>
                <div class="program-amount">` + amount + `</div>
              </div>
              <img
                class="lab-items-icon"
                loading="lazy"
                alt=""
                src="./public/` + category + `@2x.png"
              />
              <div class="program-cards-child1"></div>
              </button>
            `
	}

	defer rows.Close()

	// load scholarship.html from static/
	content, err := ioutil.ReadFile("./static/ec/results-scholarships.html")
	if err != nil {
		log.Fatal(err)
	}

	/* replace the first instance of '{}' with the html */
	content = bytes.Replace(content, []byte("{}"), []byte(htmlToInsert), 1)
	fmt.Fprintf(w, string(content))
}

/* summer programs */

func summerProgGrade(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/html; charset=utf-8")

	// read the form data from the request
	err := r.ParseForm()
	if err != nil {
		log.Print("wasn't able to parse form: ", err)
	}

	// iterate over values
	htmlToInsert := ""

	v := r.Form["subjects"]
	for i := 0; i < len(v); i++ {
		htmlToInsert += fmt.Sprintf("<input type='hidden' name='subjects' value='%s'>", v[i])
	}

	if htmlToInsert == "" {
		// redirect back to summerSubjects.html
		http.Redirect(w, r, "/static/ec/summerSubjects.html", http.StatusFound)
		return
	}

	// read the file manually first
	content, err := ioutil.ReadFile("./static/ec/grades-summer-programs.html")
	if err != nil {
		log.Fatal(err)
	}

	// replace the first two instances of '{}' with the html
	// one for next; one for back
	content = bytes.Replace(content, []byte("{}"), []byte(htmlToInsert), 2)
	fmt.Fprintf(w, string(content))

}

func resultsSummerProg(w http.ResponseWriter, r *http.Request) {
	// read the form data from the request
	err := r.ParseForm()
	if err != nil {
		// redirect back to summerSubjects.html
		http.Redirect(w, r, "/static/ec/summerSubjects.html", http.StatusFound)
		return
	}

	subjects := r.Form["subjects"]
	grades := r.Form["grades"]
	costs := r.Form["cost"]

	// check if subject is defined in form
	if subjects == nil || len(subjects) == 0 {
		// redirect back to summerSubjects.html
		http.Redirect(w, r, "/static/ec/summerSubjects.html", http.StatusFound)
		return
	}

	// check if grade and cost is defined in form
	if grades == nil || len(grades) == 0 || costs == nil || len(costs) == 0 {
		// TODO: pass form data to make this work
		params := url.Values{}

		for _, subject := range subjects {
			params.Add("subjects", subject)
		}
		http.Redirect(w, r,
			"/static/ec/grades-summer-programs.html?"+params.Encode(), http.StatusFound)
		return
	}

	/* dynamically construct the query */

	// Create placeholders for the 'IN' clause
	subjectPlaceholders := make([]string, len(subjects))
	for i := range subjects {
		subjectPlaceholders[i] = "?" // Each ? is a placeholder
	}

	gradePlaceholder := make([]string, len(grades))
	for i := range grades {
		gradePlaceholder[i] = " (startGrade <= ? AND ? <= endGrade) "
	}

	query := "SELECT * FROM summerProgs WHERE "

	if len(costs) == 1 {
		if costs[0] == "paid" {
			query += "cost > 0 AND "
		} else {
			query += "cost IS 0 AND "
		}
	}

	query += " category IN (" + strings.Join(subjectPlaceholders, ",") + ") AND (" +
		strings.Join(gradePlaceholder, " OR ") +
		" OR startGrade IS NULL OR endGrade IS NULL)" +
		" ORDER BY name ASC;"

	// Prepare arguments
	args := []interface{}{}
	for _, subject := range subjects {
		args = append(args, subject)
	}
	for _, grade := range grades {
		args = append(args, grade, grade)
	}

	// query the database for the subject
	rows, err := db.Query(query, args...)
	if err != nil {
		log.Print("Query error:", err)
	}

	htmlToInsert := ""

	// Iterate over the result set
	for rows.Next() {
		var name string
		var startGrade sql.NullInt32
		var endGrade sql.NullInt32
		var deadline sql.NullString
		var link string
		var cost string
		var scholarship sql.NullString
		var notes sql.NullString
		var category string

		// Scan the result into variables
		err := rows.Scan(&name, &startGrade, &endGrade,
			&deadline, &link, &cost, &scholarship,
			&notes, &category)

		if err != nil {
			log.Print("Error scanning row:", err)
			return
		}

		htmlToInsert += `
            <button onclick="launchModal('` + name + `')" class="program-cards2">
              <div class="nyu-applied-research" 
                data-link="` + link + `"
                data-cost="` + fmt.Sprint(cost) + `"
                data-subject="` + category + `"`

		// add the grade if its not null
		if startGrade.Valid {
			htmlToInsert += ` data-start-grade="` + fmt.Sprint(startGrade.Int32) + `"`
		}
		if endGrade.Valid {
			htmlToInsert += ` data-end-grade="` + fmt.Sprint(endGrade.Int32) + `"`
		}

		// add the deadline if its not null
		if deadline.Valid {
			htmlToInsert += ` data-deadline="` + deadline.String + `"`
		}

		// add the scholarship if its not null
		if scholarship.Valid {
			htmlToInsert += ` data-scholarship="` + scholarship.String + `"`
		}

		// add the notes if its not null
		if notes.Valid {
			htmlToInsert += ` data-notes="` + notes.String + `"`
		}

		htmlToInsert += `        id="` + name + `">` + name + `</div>
              <img
                class="lab-items-icon"
                loading="lazy"
                alt=""
                src="./public/` + category + `@2x.png"
              />
              <div class="program-cards-child1"></div>
              </button>
        `
	}

	defer rows.Close()

	// read the file manually first
	content, err := ioutil.ReadFile("./static/ec/results-page-summer-programs.html")
	if err != nil {
		log.Fatal(err)
	}

	// replace the first instance of '{}' with the html
	content = bytes.Replace(content, []byte("{}"), []byte(htmlToInsert), 1)
	fmt.Fprintf(w, string(content))
}

/* competitions */

func resultsCompetitions(w http.ResponseWriter, r *http.Request) {
	// check if category is defined
	err := r.ParseForm()
	if err != nil {
		// redirect back to scholarship.html
		http.Redirect(w, r, "/static/ec/subjects-competitions.html", http.StatusFound)
		return
	}

	// check if subjects is defined
	if r.Form["subjects"] == nil || len(r.Form["subjects"]) == 0 {
		// redirect back to scholarship.html
		http.Redirect(w, r, "/static/ec/subjects-competitions.html", http.StatusFound)
		return
	}

	// load the file manually
	content, err := ioutil.ReadFile("./static/ec/results-competitions.html")
	if err != nil {
		log.Fatal(err)
	}

	// make category placeholders
	categoryPlaceholders := make([]string, len(r.Form["subjects"]))
	for i := range r.Form["subjects"] {
		categoryPlaceholders[i] = " category LIKE ? "
	}

	query := "SELECT * FROM competitions WHERE " +
		strings.Join(categoryPlaceholders, " OR ") + " ORDER BY name ASC;"

	// Prepare arguments
	args := []interface{}{}
	for _, category := range r.Form["subjects"] {
		args = append(args, fmt.Sprintf("%%%s%%", category))
	}

	// query the database for the subject
	rows, err := db.Query(query, args...)
	if err != nil {
		log.Print("Query error:", err)
	}

	// iterate over the result set
	htmlToInsert := ""
	for rows.Next() {
		var name string
		var date sql.NullString
		var link string
		var category string
		var notes sql.NullString
		err := rows.Scan(&name, &date, &link, &category, &notes)
		if err != nil {
			log.Print("Error scanning row:", err)
			return
		}

		notesString := ""
		if notes.Valid {
			notesString = notes.String
		}

		deadlineString := "Not Found"
		if date.Valid {
			deadlineString = date.String
		}

		// check if multiple categories are dnoted by slash
		multipleCategories := strings.Split(category, "/")
		if len(multipleCategories) > 1 {
			category = multipleCategories[0]
		}

		// update htmlToInsert
		htmlToInsert += `
            <button onclick="launchModal('` + name + `')" class="program-cards2">
              <div class="nyu-applied-research" 
                data-link="` + link + `"
                data-category="` + category + `"
                data-notes="` + notesString + `"
                data-date="` + deadlineString + `"
                id="` + name + `">` + name + `</div>
              <img
                class="lab-items-icon"
                loading="lazy"
                alt=""
                src="./public/` + category + `@2x.png"
              />
              <div class="program-cards-child1"></div>
              </button>
        `
	}

	// replace the first instance of '{}' with the html
	content = bytes.Replace(content, []byte("{}"), []byte(htmlToInsert), 1)
	fmt.Fprintf(w, string(content))
}

func initializeEc(db *sql.DB) {
	// put code into initializeEc func
	// in main code: initializeEc and initializeSat
	var err error

	// create table
	_, err = db.Exec(
		`CREATE TABLE IF NOT EXISTS scholarships (
            name TEXT PRIMARY KEY NOT NULL,
            startGrade INTEGER DEFAULT 9,
            endGrade INTEGER DEFAULT 12,
            amount TEXT NOT NULL,
            deadline TEXT DEFAULT "",
            link TEXT NOT NULL,
            notes TEXT DEFAULT "",
            category TEXT DEFAULT "misc"
        );`,
	)
	if err != nil {
		log.Fatal(err)
	}

	_, err = db.Exec(
		`CREATE TABLE IF NOT EXISTS summerProgs (
            name TEXT PRIMARY KEY NOT NULL,
            start_grade INTEGER,
            end_grade INTEGER,
            deadline DATE,
            link TEXT NOT NULL,
            cost INTEGER NOT NULL,
            scholarship TEXT,
            notes TEXT,
            subject TEXT NOT NULL
        );`,
	)
	if err != nil {
		log.Fatal(err)
	}

	_, err = db.Exec(
		`CREATE TABLE IF NOT EXISTS competitions (
            name TEXT PRIMARY KEY NOT NULL,
            date TEXT DEFAULT "Unavailable",
            link TEXT NOT NULL,
            category TEXT NOT NULL,
            notes TEXT DEFAULT ""
        );`,
	)
	if err != nil {
		log.Fatal(err)
	}

	// extraciricular handlers
	http.HandleFunc("/ec", indexEc)
	http.HandleFunc("/static/ec/difficulty-scholarships.html", difficultyScholarships)
	http.HandleFunc("/static/ec/results-scholarships.html", resultsScholarship)
	http.HandleFunc("/static/ec/grades-summer-programs.html", summerProgGrade)
	http.HandleFunc("/static/ec/results-page-summer-programs.html", resultsSummerProg)
	http.HandleFunc("/static/ec/results-competitions.html", resultsCompetitions)

	// add HandleFuncs for sat /sat...


	if err != nil {
		log.Fatal(err)
	}

}
