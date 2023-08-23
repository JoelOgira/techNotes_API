const Note = require('../models/Note');
const User = require('../models/User');
const asyncHandler = require('express-async-handler');

const getAllNotes = asyncHandler(async (req, res) => {
    const notes = await Note.find().lean();
    if (!notes || notes.length === 0) {
        return res.json({ Message: "No notes found" });
    }

    // Add username to each note before sending the response 
    // See Promise.all with map() here: https://youtu.be/4lqJBBEpjRE 
    // You could also do this with a for...of loop
    const notesWithUser = await Promise.all(notes.map(async (note) => {
        const user = await User.findById(note.user).lean().exec();
        return { ...note, username: user.username };
    }));

    res.json(notesWithUser);
});

const createNewNote = asyncHandler(async (req, res) => {
    const { user, title, text } = req.body;

    if (!user || !title || !text) {
        return res.status(400).json({ Message: "All fields are required" });
    }

    // Check for duplicates 
    const duplicate = await Note.findOne({ title }).lean().exec();
    if (duplicate) {
        return res.status(409).json({ Message: "Duplicate Note" });
    }

    const noteObject = { user, title, text };

    // Create and store new user
    const note = await Note.create(noteObject);

    if (note) {
        res.status(201).json({ Message: `New note ${note.title} created successfully` });
    } else {
        res.status(400).json({ Message: "Invalid user data received" })
    }
});

const updateNote = asyncHandler(async (req, res) => {
    const { id, user, title, text, completed } = req.body;

    // Confirm data
    if (!id || !user || !title || !text || typeof completed !== 'boolean') {
        return res.status(400).json({ Message: "All fields are required" });
    }

    // Confirm note exists
    const note = await Note.findById(id).exec();

    if (!note) {
        return res.status(400).json({ Message: "Note not found" });
    }

    // Check for duplicate
    const duplicate = await Note.findOne({ title }).lean().exec();

    if (duplicate && duplicate?._id.toString() !== id) {
        return res.status(409).json({ Message: "Duplicate username" });
    }

    note.user = user;
    note.title = title;
    note.text = text;
    note.completed = completed;

    const updatedNote = await note.save();

    res.json({ Message: `${updatedNote.title} updated` });

});

const deleteNote = asyncHandler(async (req, res) => {
    const { id } = req.body;

    if (!id) {
        return res.json({ Message: "Note ID required" });
    }

    const note = await Note.findById(id).exec();

    if (!note) {
        return res.status(400).json({ Message: "Note not found" });
    }

    const result = await note.deleteOne();

    const reply = `Note with title ${result.title} deleted`;

    res.json(reply)

});

module.exports = {
    getAllNotes, createNewNote, updateNote, deleteNote
}