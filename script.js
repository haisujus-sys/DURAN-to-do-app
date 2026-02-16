/* ============================================
   To-Do App JavaScript - Main Functionality
   ============================================ */

// Get references to DOM elements
const taskInput = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const taskList = document.getElementById('taskList');
const taskCount = document.getElementById('taskCount');
const emptyState = document.getElementById('emptyState');

// Array to store tasks in memory
let tasks = [];

// localStorage key for persisting data
const STORAGE_KEY = 'toDoTasks';

/* ============================================
   Initialize Application
   ============================================ */

/**
 * Initialize the app by loading tasks from localStorage
 * and setting up event listeners
 */
function initApp() {
    // Load tasks from localStorage on page load
    loadTasks();
    
    // Render the task list
    renderTasks();
    
    // Set up event listeners
    setupEventListeners();
}

/* ============================================
   Event Listeners Setup
   ============================================ */

/**
 * Set up all event listeners for the application
 */
function setupEventListeners() {
    // Add task when clicking the "Add Task" button
    addBtn.addEventListener('click', addTask);
    
    // Add task when pressing Enter key in the input field
    taskInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            addTask();
        }
    });
    
    // Clear input field on focus (optional UX improvement)
    taskInput.addEventListener('focus', () => {
        taskInput.value = '';
    });
}

/* ============================================
   Task Management Functions
   ============================================ */

/**
 * Add a new task to the list
 * Validates that the input is not empty
 */
function addTask() {
    const taskText = taskInput.value.trim();
    
    // Validate that task is not empty
    if (taskText === '') {
        alert('Please enter a task!');
        taskInput.focus();
        return;
    }
    
    // Create a new task object with unique ID and timestamp
    const newTask = {
        id: Date.now(), // Use timestamp as unique ID
        text: taskText,
        completed: false,
        createdAt: new Date().toLocaleString()
    };
    
    // Add task to the tasks array
    tasks.push(newTask);
    
    // Save tasks to localStorage
    saveTasks();
    
    // Clear the input field
    taskInput.value = '';
    
    // Re-render the task list
    renderTasks();
    
    // Focus back on input for better UX
    taskInput.focus();
}

/**
 * Toggle the completed status of a task
 * @param {number} taskId - The unique ID of the task
 */
function toggleTask(taskId) {
    // Find the task by ID
    const task = tasks.find(t => t.id === taskId);
    
    if (task) {
        // Toggle the completed status
        task.completed = !task.completed;
        
        // Save the updated tasks to localStorage
        saveTasks();
        
        // Re-render the task list to show the updated state
        renderTasks();
    }
}

/**
 * Delete a task from the list
 * @param {number} taskId - The unique ID of the task to delete
 */
function deleteTask(taskId) {
    // Filter out the task with the matching ID
    tasks = tasks.filter(t => t.id !== taskId);
    
    // Save the updated tasks to localStorage
    saveTasks();
    
    // Re-render the task list
    renderTasks();
}

/* ============================================
   Rendering Functions
   ============================================ */

/**
 * Render all tasks in the DOM
 * Dynamically creates task items and appends them to the task list
 */
function renderTasks() {
    // Clear the existing task list
    taskList.innerHTML = '';
    
    // Check if there are any tasks
    if (tasks.length === 0) {
        // Show the empty state message
        emptyState.classList.add('show');
        taskCount.textContent = '0';
        return;
    }
    
    // Hide the empty state message
    emptyState.classList.remove('show');
    
    // Loop through each task and create DOM elements
    tasks.forEach(task => {
        // Create a list item
        const listItem = document.createElement('li');
        listItem.className = 'task-item';
        
        // Add the 'completed' class if task is marked as complete
        if (task.completed) {
            listItem.classList.add('completed');
        }
        
        // Create checkbox input
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'task-checkbox';
        checkbox.checked = task.completed;
        // Toggle task status when checkbox is clicked
        checkbox.addEventListener('change', () => toggleTask(task.id));
        
        // Create task text span
        const textSpan = document.createElement('span');
        textSpan.className = 'task-text';
        textSpan.textContent = task.text;
        
        // Create delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = 'Delete';
        // Delete task when button is clicked
        deleteBtn.addEventListener('click', () => deleteTask(task.id));
        
        // Append all elements to the list item
        listItem.appendChild(checkbox);
        listItem.appendChild(textSpan);
        listItem.appendChild(deleteBtn);
        
        // Append the list item to the task list
        taskList.appendChild(listItem);
    });
    
    // Update the task counter to show remaining incomplete tasks
    const incompleteTasks = tasks.filter(t => !t.completed).length;
    taskCount.textContent = incompleteTasks;
}

/* ============================================
   LocalStorage Functions
   ============================================ */

/**
 * Save all tasks to localStorage
 * Converts the tasks array to JSON and stores it
 */
function saveTasks() {
    // Convert tasks array to JSON string
    const tasksJSON = JSON.stringify(tasks);
    
    // Store in localStorage with the predefined key
    localStorage.setItem(STORAGE_KEY, tasksJSON);
}

/**
 * Load tasks from localStorage
 * Retrieves saved tasks and populates the tasks array
 */
function loadTasks() {
    // Retrieve the JSON string from localStorage
    const tasksJSON = localStorage.getItem(STORAGE_KEY);
    
    // If tasks exist in localStorage, parse and load them
    if (tasksJSON) {
        try {
            tasks = JSON.parse(tasksJSON);
        } catch (error) {
            // Handle JSON parsing error
            console.error('Error loading tasks from localStorage:', error);
            tasks = [];
        }
    } else {
        // Initialize with empty array if no tasks found
        tasks = [];
    }
}

/* ============================================
   Application Startup
   ============================================ */

// Run the initialization function when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initApp);
