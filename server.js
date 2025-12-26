const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static('public'));

// This ensures we find the file correctly
const DATA_FILE = path.join(__dirname, 'notes.json');

// --- THE FIX: SAFETY FIRST ---
const readNotes = () => {
    try {
        // 1. If file is missing, create it
        if (!fs.existsSync(DATA_FILE)) {
            console.log("⚠️ File missing. Creating new notes.json...");
            fs.writeFileSync(DATA_FILE, '[]', 'utf8');
            return [];
        }

        // 2. Read the file
        const fileData = fs.readFileSync(DATA_FILE, 'utf8');

        // 3. If file is empty, return empty list
        if (!fileData || fileData.trim() === '') {
            return [];
        }

        // 4. Parse the JSON
        return JSON.parse(fileData);
    } catch (err) {
        // 5. If file is broken, RESET it
        console.error("❌ Error reading file. Resetting to empty list.");
        fs.writeFileSync(DATA_FILE, '[]', 'utf8');
        return [];
    }
};

const writeNotes = (notes) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(notes, null, 2));
};

// API ROUTES
app.get('/api/notes', (req, res) => {
    const notes = readNotes();
    res.json(notes);
});

app.post('/api/notes', (req, res) => {
    const notes = readNotes();
    const newNote = {
        id: Date.now().toString(),
        title: req.body.title || "No Title",
        content: req.body.content || "No Details",
        category: req.body.category || "General"
    };
    notes.push(newNote);
    writeNotes(notes);
    console.log("✅ Saved Note:", newNote.title);
    res.json(newNote);
});

app.delete('/api/notes/:id', (req, res) => {
    const notes = readNotes();
    const filteredNotes = notes.filter(n => n.id !== req.params.id);
    writeNotes(filteredNotes);
    res.json({ success: true });
});

// START SERVER
app.listen(3000, () => console.log("🚀 Server is running! Go to http://localhost:3000"));