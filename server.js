var express = require("express");
var app = express();
var port = 3000;
var bodyParser = require('body-parser');

// Middleware for parsing JSON and URL-encoded bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve the script.js file with the correct MIME type
app.get("/script.js", function(req, res) {
  res.setHeader('Content-Type', 'text/javascript');
  res.sendFile(__dirname + '/script.js');
});

// Serve static files
app.use(express.static(__dirname));

var mongoose = require("mongoose");
mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost:27017/task_manager");

// Define the task schema
var taskSchema = new mongoose.Schema({
  description: String,
  priority: String,
  status: {
  type: String,
  enum: ['To do', 'In progress', 'Done'],
  default: 'To do',
  },
});

// Create the Task model based on the schema
var Task = mongoose.model("Task", taskSchema);

// Route for the homepage
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// API endpoint to fetch all tasks
app.get("/tasks", (req, res) => {
  Task.find({})
  .then((tasks) => {
   res.json(tasks);
    })
  .catch((err) => {
  res.status(500).json({ error: 'Internal server error' });
    });
});

// API endpoint to add a new task
app.post("/tasks", (req, res) => {
  var taskData = req.body;
  var task = new Task(taskData);
  task.save()
    .then((savedTask) => {
      res.json(savedTask);
    })
    .catch((err) => {
      res.status(500).json({ error: 'Internal server error' });
    });
});

// API endpoint to update a task
app.put("/tasks/:id", (req, res) => {
  var taskId = req.params.id;
  var taskData = req.body;

Task.findByIdAndUpdate(taskId, taskData, { new: true })
 .then((updatedTask) => {
  if (!updatedTask) {
  return res.status(404).json({ error: 'Task not found' });
  }
  res.json(updatedTask);
  })
  .catch((err) => {
    res.status(500).json({ error: 'Internal server error' });
   });
});

// API endpoint to delete a task
app.delete("/tasks/:id", (req, res) => {
  var taskId = req.params.id;

Task.findByIdAndDelete(taskId)
  .then((deletedTask) => {
    if (!deletedTask) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.sendStatus(204);
  })
  .catch((err) => {
    res.status(500).json({ error: 'Internal server error' });
   });
});

// Start the server
app.listen(port, () => {
  console.log("Server listening on port " + port);
});
