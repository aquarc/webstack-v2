
// the container so we can remove the cards children
var container = document.getElementsByClassName("program-grid")[0];


// select all the divs with class "nyu-applied-research"
var cards = document.querySelectorAll(".program-cards2");
var allCards = Array.from(cards);

// get the input element
var input = document.getElementById("search");

// every time the input changes, run the filter function
input.addEventListener("input", () => {
    const threshold = 5;

    container.innerHTML = `
        <div class="program-cards3">
          <div class="program-cards-child2"></div>
          <div class="need-feedback-on">
              need feedback on your ECs or advice from experts? join <a href="https://discord.gg/QMahMhBUsK">our discord!</a>
          </div>
        </div>` ;

    if (input.value.length == 0) {
        clear.click();
        return;
    }

    // filter and sort cards from global array
    // Filter and sort cards from the global array
    const filteredSortedCards = allCards
        .map(card => {
            const text = card.children[0].children[0].textContent
                .slice(0, input.value.length).toLowerCase();

            const dist = distance_sl(input.value.toLowerCase(), text);
            return { card, dist };
        })
        .filter(({ dist }) => dist <= threshold)  // Filter by distance threshold
        .sort((a, b) => a.dist - b.dist)           // Sort by distance
        .map(({ card }) => card);

    // Add the filtered and sorted cards to the DOM
    filteredSortedCards.forEach(card => {
        container.appendChild(card);
    });

    /*
    for (var i = 0; i < cards.length; i++) {
        if (distance(input.value.toLowerCase(), 
            cards[i].childNodes[1].textContent.slice(0, input.value.length).toLowerCase()) 
            <= 3 || input.value.length == 0) {
            cards[i].style.display = "block";
        } else {
            cards[i].style.display = "none";
        }
    }
    
    console.log(input.value);
    */
});

function distance_sl(a, b) {
    let cost = 0;
    for (let i = 0; i < Math.min(a.length, b.length); i++) {
        if (a[i] != b[i]) {
            cost += 1;
        }
    }
    return cost
} 

// thank you Vincent Loh 
function distance(a, b){
	dp = [];

	for(let i=0; i<=a.length; ++i){
		dp.push([]);
		for(let j=0; j<=b.length; ++j)
			dp[i].push(0);
		dp[i][0] = parseInt(i);
	}

	for(i in dp[0]) dp[0][i] = parseInt(i);

	for(let i=0; i<a.length; ++i)
		for(let j=0; j<b.length; ++j)
			dp[i+1][j+1] = Math.min(Math.min(dp[i+1][j], dp[i][j+1]) + 1,
				dp[i][j] + (a[i] == b[j] ? 0 : 1));

	return dp[a.length][b.length]
}

// clear element
var clear = document.getElementById("clear");
clear.addEventListener("click", () => {
    search.value = "";

    // show all the cards again

    container.innerHTML = `
        <div class="program-cards3">
          <div class="program-cards-child2"></div>
          <div class="need-feedback-on">
              need feedback on your ECs or advice from experts? join <a href="https://discord.gg/QMahMhBUsK">our discord!</a>
          </div>
        </div>` ;
    for (var i = 0; i < allCards.length; i++) {
        container.appendChild(allCards[i]);
    }
});


// filter element
var filter = document.getElementById("filter");
filter.addEventListener("click", () => {
    // not implemented
    location.href = "/";
});

// save element
var save = document.getElementById("save");
save.addEventListener("click", () => {
    // not implemented
    location.href = "/";
});

function save() {
    // not implemented
    location.href = "/";
}


function launchModal(name) {
  // get the element
  const nameElement = document.getElementById(name);

  // Create the modal overlay
  const modalOverlay = document.createElement('div');
  modalOverlay.classList.add('modal-overlay');

  // Create the modal content
  const modalContent = document.createElement('div');
  modalContent.classList.add('modal');

  // Create the "boa- student leaders" header
  const header = document.createElement('h2');
  header.innerText = name;
  header.classList.add('modal-header');
  modalContent.appendChild(header);

  // Button container
  const buttonContainer = document.createElement('div');
  buttonContainer.classList.add('modal-button-container');

  // Create buttons
  const buttonLabels = 
        [nameElement.dataset.grades,
            nameElement.dataset.deadline,
            nameElement.dataset.category];

  buttonLabels.forEach(label => {
    const button = document.createElement('button');
    button.innerText = label;
    button.classList.add('modal-button');
    buttonContainer.appendChild(button);
  });

  modalContent.appendChild(buttonContainer);

  // Description paragraph
  const description = document.createElement('p');
  description.innerHTML = nameElement.dataset.notes;
  description.classList.add('modal-description');
  modalContent.appendChild(description);

  // Apply button
  const applyButton = document.createElement('a');
  applyButton.href = nameElement.dataset.link;
  applyButton.innerText = 'apply!';
  applyButton.classList.add('modal-apply');
  modalContent.appendChild(applyButton);

  // Add modal content to overlay
  modalOverlay.appendChild(modalContent);

  // Append overlay to body
  document.body.appendChild(modalOverlay);

  // Close modal when clicking on the overlay
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
      document.body.removeChild(modalOverlay);
    }
  });
}
