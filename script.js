// Get references to the elements in the DOM
const addButton = document.getElementById('addButton');
const modal = document.getElementById('modal');
const closeBtn = document.querySelectorAll('.close');
const taskForm = document.getElementById('taskForm');
const taskList = document.getElementById('taskList');
const editModal = document.getElementById('editModal');
const editForm = document.getElementById('editForm');

// Helper function to create a task item in the task list
function createTaskItem(task) {
const li = document.createElement('li');
li.innerHTML = `
  <span class="task-description">${task.description}</span>
  <span class="task-priority">${task.priority}</span>
  <span class="task-status">${task.status}</span>
  <button class="edit-button" data-task-id="${task._id}">Edit</button>
  <button class="delete-button" data-task-id="${task._id}">Delete</button>
`;

// Add event listeners for the edit and delete buttons
li.querySelector('.edit-button').addEventListener('click', (e) => {
 const taskId = e.target.getAttribute('data-task-id');
 showEditModal(taskId);
});
li.querySelector('.delete-button').addEventListener('click', (e) => {
  const taskId = e.target.getAttribute('data-task-id');
  deleteTask(taskId);
});

// Append the task item to the task list
taskList.appendChild(li);
}

// Show the modal when the add button is clicked
addButton.addEventListener('click', () => {
  modal.style.display = 'block';
});

// Hide the modal when the close button is clicked
closeBtn.forEach((btn) => {
  btn.addEventListener('click', () => {
  modal.style.display = 'none';
  editModal.style.display = 'none';
  });
});

// Hide the modal when the user clicks outside the modal
window.addEventListener('click', (e) => {
  if (e.target === modal) {
  modal.style.display = 'none';
  }
  if (e.target === editModal) {
  editModal.style.display = 'none';
  }
});

// Fetch tasks from the API
function fetchTasks() {
  fetch('/tasks')
  .then((response) => response.json())
  .then((data) => {
  // Clear the task list before populating it with fetched tasks
  taskList.innerHTML = '';
  // Create task items for each task fetched from the API
  data.forEach((task) => createTaskItem(task));
  })
  .catch((error) => console.error('Error:', error));
}

// Add a new task
function addTask(description, priority, status) {
 const task = { description, priority, status };
 fetch('/tasks', {
  method: 'POST',
  headers: {
  'Content-Type': 'application/json',
  },
  body: JSON.stringify(task),
  })
  .then((response) => response.json())
  .then((data) => {
  // Create a task item for the newly added task
  createTaskItem(data);
  // Hide the modal after adding the task
  modal.style.display = 'none';
  })
  .catch((error) => console.error('Error:', error));
}

// Show the edit modal with task details
function showEditModal(taskId) {
  // Get the task item corresponding to the clicked edit button
  const taskItem = document.querySelector(`li .edit-button[data-task-id="${taskId}"]`).parentNode;
  const description = taskItem.querySelector('.task-description').textContent;
  const priority = taskItem.querySelector('.task-priority').textContent;
  const status = taskItem.querySelector('.task-status').textContent;

  // Set the input values in the edit form
  document.getElementById('editDescription').value = description;
  document.getElementById('editPriority').value = priority;
  document.getElementById('editStatus').value = status;
  // Set the data-task-id attribute on the edit form
  editForm.setAttribute('data-task-id', taskId);
  // Show the edit modal
  editModal.style.display = 'block';
}

// Update a task on edit form submission
editForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const taskId = editForm.getAttribute('data-task-id');
  const newDescription = document.getElementById('editDescription').value;
  const newPriority = document.getElementById('editPriority').value;
  const newStatus = document.getElementById('editStatus').value;
  editTask(taskId, newDescription, newPriority, newStatus);
  // Hide the edit modal
  editModal.style.display = 'none';
});

// Edit a task
function editTask(taskId, description, priority, status) {
const task = { description, priority, status };

  fetch(`/tasks/${taskId}`, {
  method: 'PUT',
  headers: {
  'Content-Type': 'application/json',
    },
    body: JSON.stringify(task),
  })
  .then((response) => response.json())
  .then((data) => {
  // Refresh the task list after editing a task
  fetchTasks();
  })
  .catch((error) => console.error('Error:', error));
}

// Delete a task
function deleteTask(taskId) {
  if (confirm('Are you sure you want to delete this task?')) {
  fetch(`/tasks/${taskId}`, {
  method: 'DELETE',
  })
  .then(() => {

  // Refresh the task list after deleting a task
  fetchTasks();
  })
  .catch((error) => console.error('Error:', error));
  }
}

// Event listener for task form submission
taskForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const description = document.getElementById('taskDescription').value;
  const priority = document.getElementById('taskPriority').value;
  const status = document.getElementById('taskStatus').value;
  addTask(description, priority, status);

  // Reset the form inputs after adding a task
  taskForm.reset();
});

// Fetch tasks on page load
fetchTasks();
