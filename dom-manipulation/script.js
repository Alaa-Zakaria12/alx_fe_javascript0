// Initial Quotes Array
let quotes = [
    { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation" },
    { text: "Life is 10% what happens to us and 90% how we react to it.", category: "Life" },
    { text: "Do what you can, with what you have, where you are.", category: "Inspiration" }
];

// Server URL (Using JSONPlaceholder as a mock API)
const serverUrl = 'https://jsonplaceholder.typicode.com/posts'; // Replace with actual API if available

// Function to Display a Random Quote
function showRandomQuote() {
    if (quotes.length === 0) {
        alert("No quotes available to display.");
        return;
    }
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const quote = quotes[randomIndex];
    
    const quoteDisplay = document.getElementById("quoteDisplay");
    quoteDisplay.innerHTML = `<p>"${quote.text}" - <em>${quote.category}</em></p>`;
    
    // Store the last viewed quote in session storage
    sessionStorage.setItem('lastViewedQuote', JSON.stringify(quote));
}

// Function to Add a New Quote
function addQuote() {
    const newQuoteText = document.getElementById("newQuoteText").value.trim();
    const newQuoteCategory = document.getElementById("newQuoteCategory").value.trim();
  
    if (newQuoteText && newQuoteCategory) {
        const newQuote = { text: newQuoteText, category: newQuoteCategory };
        quotes.push(newQuote);
        saveQuotes(); // Save to local storage
        populateCategories(); // Update categories dropdown
  
        // Clear input fields
        document.getElementById("newQuoteText").value = '';
        document.getElementById("newQuoteCategory").value = '';
  
        notifyUser("New quote added!");
        postQuoteToServer(newQuote); // Post to server
    } else {
        alert("Please enter both the quote text and category.");
    }
}

// Function to Save Quotes to Local Storage
function saveQuotes() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Function to Load Quotes from Local Storage
function loadQuotes() {
    const storedQuotes = localStorage.getItem('quotes');
    if (storedQuotes) {
        quotes = JSON.parse(storedQuotes);
    }
}

// Function to Export Quotes to JSON File
function exportToJsonFile() {
    const json = JSON.stringify(quotes, null, 2); // Pretty print with indentation
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quotes.json';
    a.click();
    
    URL.revokeObjectURL(url); // Clean up URL object
}

// Function to Import Quotes from JSON File
function importFromJsonFile(event) {
    const fileReader = new FileReader();
    fileReader.onload = function(event) {
        try {
            const importedQuotes = JSON.parse(event.target.result);
            if (Array.isArray(importedQuotes)) {
                quotes = quotes.concat(importedQuotes);
                saveQuotes(); // Save imported quotes to local storage
                populateCategories(); // Update categories dropdown
                notifyUser('Quotes imported successfully!');
            } else {
                alert('Invalid JSON format. Please upload an array of quotes.');
            }
        } catch (error) {
            alert('Failed to import quotes: Invalid JSON file.');
            console.error('Import Error:', error);
        }
    };
    if (event.target.files.length > 0) {
        fileReader.readAsText(event.target.files[0]);
    }
}

// Function to Populate Categories Dropdown
function populateCategories() {
    const categories = [...new Set(quotes.map(quote => quote.category))]; // Get unique categories
    const categoryFilter = document.getElementById('categoryFilter');

    // Clear existing options (except "All Categories")
    categoryFilter.innerHTML = '<option value="all">All Categories</option>';

    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
}

// Function to Filter Quotes Based on Selected Category
function filterQuotes() {
    const selectedCategory = document.getElementById('categoryFilter').value;
    
    const filteredQuotes = selectedCategory === 'all' 
        ? quotes 
        : quotes.filter(quote => quote.category === selectedCategory);

    // Display the filtered quotes
    const quoteDisplay = document.getElementById("quoteDisplay");
    quoteDisplay.innerHTML = '';

    if (filteredQuotes.length === 0) {
        quoteDisplay.innerHTML = "<p>No quotes found for this category.</p>";
        return;
    }

    filteredQuotes.forEach(quote => {
        quoteDisplay.innerHTML += `<p>"${quote.text}" - <em>${quote.category}</em></p>`;
    });

    // Save the selected filter to local storage
    localStorage.setItem('selectedCategory', selectedCategory);
}

// Function to Load the Last Selected Category Filter
function loadSelectedCategory() {
    const selectedCategory = localStorage.getItem('selectedCategory') || 'all';
    document.getElementById('categoryFilter').value = selectedCategory;
    filterQuotes(); // Apply the filter
}

// Function to Load the Last Viewed Quote from Session Storage
function loadLastViewedQuote() {
    const lastQuote = sessionStorage.getItem('lastViewedQuote');
    if (lastQuote) {
        const quote = JSON.parse(lastQuote);
        const quoteDisplay = document.getElementById("quoteDisplay");
        quoteDisplay.innerHTML = `<p>"${quote.text}" - <em>${quote.category}</em></p>`;
    }
}

// Function to Notify User with Messages
function notifyUser(message) {
    const notificationArea = document.getElementById('notificationArea');
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;

    notificationArea.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 5000); // Remove after 5 seconds
}

// Function to Fetch Quotes from the Server
function fetchQuotesFromServer() {
    fetch(serverUrl)
        .then(response => response.json())
        .then(data => {
            const serverQuotes = data.map(item => ({
                text: item.title,
                category: 'Server' // Assign a default category or derive from data if available
            }));
            resolveConflicts(serverQuotes); // Resolve conflicts between server and local data
        })
        .catch(error => console.error('Error fetching quotes from server:', error));
}

// Function to Post a New Quote to the Server
function postQuoteToServer(quote) {
    fetch(serverUrl, {
        method: 'POST',
        body: JSON.stringify(quote),
        headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    })
    .then(response => response.json())
    .then(data => console.log('Quote posted successfully:', data))
    .catch(error => console.error('Error posting quote to server:', error));
}

// Function to Merge Local and Server Quotes (Server Takes Precedence)
function mergeQuotes(localQuotes, serverQuotes) {
    const merged = [...serverQuotes];

    localQuotes.forEach(localQuote => {
        // If the local quote is not already in server quotes, add it
        if (!serverQuotes.some(serverQuote => serverQuote.text === localQuote.text)) {
            merged.push(localQuote);
        }
    });

    return merged;
}

// Function to Resolve Conflicts Between Server and Local Quotes
function resolveConflicts(serverQuotes) {
    const localQuotes = [...quotes]; // Clone local quotes
    const mergedQuotes = mergeQuotes(localQuotes, serverQuotes);

    // Check if there are new quotes from the server
    if (mergedQuotes.length !== quotes.length) {
        quotes = mergedQuotes;
        saveQuotes(); // Update local storage with merged quotes
        populateCategories(); // Update categories dropdown
        filterQuotes(); // Update displayed quotes
        notifyUser('Data synced with server and conflicts resolved.');
    }
}

// Function to Sync Quotes with the Server
function syncQuotes() {
    fetchQuotesFromServer();
}

// Function for Manual Conflict Resolution (Optional Enhancement)
function manualConflictResolution(serverQuotes) {
    serverQuotes.forEach(serverQuote => {
        const localQuote = quotes.find(localQuote => localQuote.text === serverQuote.text);
    
        if (localQuote) {
            const userChoice = confirm(`Conflict detected!\n\nServer quote: "${serverQuote.text}"\nLocal quote: "${localQuote.text}"\n\nDo you want to keep the server version?`);
    
            if (userChoice) {
                // Overwrite local quote with server quote
                localQuote.category = serverQuote.category;
            }
        }
    });
  
    saveQuotes(); // Save after resolving conflicts
    populateCategories(); // Update categories dropdown
    filterQuotes(); // Update displayed quotes
}

// Initial Setup on Page Load
window.onload = function() {
    loadQuotes();             // Load quotes from local storage
    loadLastViewedQuote();    // Load the last viewed quote from session storage
    populateCategories();     // Populate categories dropdown
    loadSelectedCategory();   // Apply the last selected category filter

    // Optionally, perform an initial sync with the server
    syncQuotes();
};

// Event Listeners
document.getElementById('addQuoteBtn').addEventListener('click', addQuote);
document.getElementById('newQuote').addEventListener('click', showRandomQuote);
document.getElementById('exportBtn').addEventListener('click', exportToJsonFile);
document.getElementById('importFile').addEventListener('change', importFromJsonFile);
document.getElementById('categoryFilter').addEventListener('change', filterQuotes);

// Periodically Sync with Server (Every 10 Minutes)
setInterval(syncQuotes, 600000); // 600,000 ms = 10 minutes

// Optionally, you can also set up another periodic fetch (e.g., every 30 seconds)
// setInterval(fetchQuotesFromServer, 30000); // Uncomment if needed
