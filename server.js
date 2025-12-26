const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

// Middleware
app.use(express.json());
app.use(express.static('public'));

// The file where notes will be saved
const DATA_FILE = path.join(__dirname, 'notes.json');

// Helper: Read notes from file
const readNotes = () => {
    if (!fs.existsSync(DATA_FILE)) {
        return []; // If file doesn't exist, return empty list
    }
    const data = fs.readFileSync(DATA_FILE);
    return JSON.parse(data);
};

// Helper: Write notes to file
const writeNotes = (notes) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(notes, null, 2));
};

// --- API ROUTES ---

// 1. Get all notes
app.get('/api/notes', (req, res) => {
    const notes = readNotes();
    res.json(notes);
});

// 2. Add a note
app.post('/api/notes', (req, res) => {
    const notes = readNotes();
    const newNote = {
        id: Date.now().toString(), // Generate a unique ID based on time
        title: req.body.title,
        content: req.body.content,
        category: req.body.category,
        date: new Date()
    };
    
    notes.push(newNote);
    writeNotes(notes);
    res.json(newNote);
});

// 3. Delete a note
app.delete('/api/notes/:id', (req, res) => {
    let notes = readNotes();
    // Filter out the note with the matching ID
    notes = notes.filter(note => note.id !== req.params.id);
    writeNotes(notes);
    res.json({ message: "Deleted successfully" });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 JSON App running at http://localhost:${PORT}`));