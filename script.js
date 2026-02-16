/* ============================================
   Activity To-Do App JavaScript - Main Functionality
   ============================================ */

// Get reference to the cards container
const cardsContainer = document.getElementById('cardsContainer');

// Counter for generating unique card IDs
let cardCounter = 4;

// localStorage key for persisting data
const STORAGE_KEY = 'activityToDo';

/* ============================================
   Initialize Application
   ============================================ */

/**
 * Initialize the app on page load
 * Load saved cards from localStorage
 */
document.addEventListener('DOMContentLoaded', function() {
    // Load cards from localStorage if available
    loadCards();
});

/* ============================================
   Add New Card Function
   ============================================ */

/**
 * Add a new empty task card to the board
 * User will be able to populate it with tasks
 */
function addNewCard() {
    // Generate unique ID for the new card
    cardCounter++;
    const cardId = `card-${cardCounter}`;
    
    // Create the new card element
    const newCard = document.createElement('article');
    newCard.className = 'card';
    newCard.id = cardId;
    
    // Get the card color class (rotate between different styles)
    const colorIndex = cardCounter % 3;
    
    // Build the card HTML
    newCard.innerHTML = `
        <div class="card-header">
            <h3 class="card-title">New Task</h3>
            <button class="card-delete-btn" aria-label="Delete card" onclick="deleteCard('${cardId}')">✕</button>
        </div>
        <ul class="card-tasks">
            <!-- Tasks will be added here -->
        </ul>
        <div class="card-input-section">
            <input type="text" class="add-task-input" placeholder="Add a new task..." onkeypress="handleAddTask(event, this)">
            <button class="add-task-btn" onclick="addTaskToCard(this)">Add</button>
        </div>
    `;
    
    // Insert the new card before the add button
    cardsContainer.appendChild(newCard);
    
    // Save changes to localStorage
    saveCards();
}

/* ============================================
   Add Task to Card Function
   ============================================ */

/**
 * Add a new task to a specific card
 * @param {Element} button - The add button element clicked
 */
function addTaskToCard(button) {
    // Get the input field in the same card
    const input = button.previousElementSibling;
    const taskText = input.value.trim();
    
    // Validate that task is not empty
    if (taskText === '') {
        input.focus();
        return;
    }
    
    // Get the task list in this card
    const taskList = button.closest('.card').querySelector('.card-tasks');
    
    // Create a new task item
    const newTask = document.createElement('li');
    newTask.className = 'card-task';
    
    // Build the task HTML with checkbox, text, and delete button
    newTask.innerHTML = `
        <input type="checkbox" class="task-checkbox" onchange="toggleTask(this)">
        <span class="task-content">${escapeHtml(taskText)}</span>
        <button class="delete-task-btn" onclick="deleteTask(this)">✕</button>
    `;
    
    // Append the new task to the task list
    taskList.appendChild(newTask);
    
    // Clear the input field
    input.value = '';
    
    // Focus back on input for better UX
    input.focus();
    
    // Save changes to localStorage
    saveCards();
}

/* ============================================
   Handle Enter Key for Task Input
   ============================================ */

/**
 * Handle Enter key press in task input field
 * Adds task when user presses Enter
 * @param {Event} event - The keyboard event
 * @param {Element} input - The input element
 */
function handleAddTask(event, input) {
    // Check if Enter key was pressed
    if (event.key === 'Enter') {
        event.preventDefault();
        
        // Get the add button in the same section
        const addBtn = input.nextElementSibling;
        
        // Trigger the add task function
        addTaskToCard(addBtn);
    }
}

/* ============================================
   Toggle Task Completion
   ============================================ */

/**
 * Toggle the completed state of a task
 * Adds strike-through effect when completed
 * @param {Element} checkbox - The checkbox input element
 */
function toggleTask(checkbox) {
    // Get the parent task item
    const taskItem = checkbox.closest('.card-task');
    
    // The CSS will handle the strike-through effect
    // This is purely for data persistence
    
    // Save changes to localStorage
    saveCards();
}

/* ============================================
   Delete Task Function
   ============================================ */

/**
 * Delete a task from the card
 * @param {Element} button - The delete button element
 */
function deleteTask(button) {
    // Get the parent task item
    const taskItem = button.closest('.card-task');
    
    // Remove the task from the DOM
    taskItem.remove();
    
    // Save changes to localStorage
    saveCards();
}

/* ============================================
   Delete Card Function
   ============================================ */

/**
 * Delete an entire card from the board
 * @param {string} cardId - The ID of the card to delete
 */
function deleteCard(cardId) {
    // Confirm deletion with user
    if (confirm('Are you sure you want to delete this card? This action cannot be undone.')) {
        // Find the card element by ID
        const card = document.getElementById(cardId);
        
        // Remove the card from the DOM
        if (card) {
            card.remove();
        }
        
        // Save changes to localStorage
        saveCards();
    }
}

/* ============================================
   LocalStorage Functions
   ============================================ */

/**
 * Save all cards and their tasks to localStorage
 * Converts the DOM structure into a JSON format
 */
function saveCards() {
    // Get all cards from the DOM
    const cards = document.querySelectorAll('.card');
    
    // Create array to store card data
    const cardsData = [];
    
    // Loop through each card and extract its data
    cards.forEach(card => {
        // Get the card title
        const title = card.querySelector('.card-title').textContent;
        
        // Get all tasks in this card
        const tasks = [];
        card.querySelectorAll('.card-task').forEach(taskItem => {
            const checkbox = taskItem.querySelector('.task-checkbox');
            const content = taskItem.querySelector('.task-content');
            
            // Store task data
            tasks.push({
                text: content.textContent,
                completed: checkbox.checked
            });
        });
        
        // Store card data
        cardsData.push({
            id: card.id,
            title: title,
            tasks: tasks
        });
    });
    
    // Save to localStorage as JSON
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cardsData));
}

/**
 * Load cards from localStorage and restore them to the DOM
 */
function loadCards() {
    // Get the saved data from localStorage
    const savedData = localStorage.getItem(STORAGE_KEY);
    
    // If no saved data, return early
    if (!savedData) {
        return;
    }
    
    try {
        // Parse the JSON data
        const cardsData = JSON.parse(savedData);
        
        // Get the current cards in the DOM
        const existingCards = document.querySelectorAll('.card');
        
        // If we have existing cards, clear them first
        // (Keep only the initial cards for first load)
        if (existingCards.length < cardsData.length) {
            // Load each card from saved data
            cardsData.forEach((cardData, index) => {
                if (index >= existingCards.length) {
                    // Create new card if it doesn't exist
                    createCardFromData(cardData);
                } else {
                    // Update existing card with saved data
                    const card = existingCards[index];
                    updateCardWithData(card, cardData);
                }
            });
        }
    } catch (error) {
        // Handle JSON parsing error
        console.error('Error loading cards from localStorage:', error);
    }
}

/**
 * Create a new card from saved data
 * @param {Object} cardData - The card data object
 */
function createCardFromData(cardData) {
    // Create new card element
    const newCard = document.createElement('article');
    newCard.className = 'card';
    newCard.id = cardData.id;
    
    // Update card counter if needed
    const cardNum = parseInt(cardData.id.split('-')[1]);
    if (cardNum > cardCounter) {
        cardCounter = cardNum;
    }
    
    // Build tasks HTML
    let tasksHTML = '';
    cardData.tasks.forEach(task => {
        const checked = task.completed ? 'checked' : '';
        tasksHTML += `
            <li class="card-task">
                <input type="checkbox" class="task-checkbox" onchange="toggleTask(this)" ${checked}>
                <span class="task-content">${escapeHtml(task.text)}</span>
                <button class="delete-task-btn" onclick="deleteTask(this)">✕</button>
            </li>
        `;
    });
    
    // Build the card HTML
    newCard.innerHTML = `
        <div class="card-header">
            <h3 class="card-title">${escapeHtml(cardData.title)}</h3>
            <button class="card-delete-btn" aria-label="Delete card" onclick="deleteCard('${cardData.id}')">✕</button>
        </div>
        <ul class="card-tasks">
            ${tasksHTML}
        </ul>
        <div class="card-input-section">
            <input type="text" class="add-task-input" placeholder="Add a new task..." onkeypress="handleAddTask(event, this)">
            <button class="add-task-btn" onclick="addTaskToCard(this)">Add</button>
        </div>
    `;
    
    // Append to container
    cardsContainer.appendChild(newCard);
}

/**
 * Update an existing card with saved data
 * @param {Element} card - The card element
 * @param {Object} cardData - The card data object
 */
function updateCardWithData(card, cardData) {
    // Update card title
    const titleElement = card.querySelector('.card-title');
    titleElement.textContent = cardData.title;
    
    // Update tasks
    const taskList = card.querySelector('.card-tasks');
    taskList.innerHTML = '';
    
    cardData.tasks.forEach(task => {
        const checked = task.completed ? 'checked' : '';
        const taskItem = document.createElement('li');
        taskItem.className = 'card-task';
        taskItem.innerHTML = `
            <input type="checkbox" class="task-checkbox" onchange="toggleTask(this)" ${checked}>
            <span class="task-content">${escapeHtml(task.text)}</span>
            <button class="delete-task-btn" onclick="deleteTask(this)">✕</button>
        `;
        taskList.appendChild(taskItem);
    });
}

/* ============================================
   Utility Functions
   ============================================ */

/**
 * Escape HTML special characters to prevent XSS attacks
 * Converts & < > " ' to their HTML entities
 * @param {string} text - The text to escape
 * @returns {string} - The escaped text
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
