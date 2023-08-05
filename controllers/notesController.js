const Note = require('../models/Note');
const asyncHandler = require('express-async-handler');

const getAllNotes = asyncHandler(async (req, res) => {
    const notes = await Note.find().lean();
    if (!notes || notes.length === 0) {
        return res.json({ Message: "No notes found" });
    }
    res.json(notes);
});

const createNewNote = asyncHandler(async (req, res) => {

});

const updateNote = asyncHandler(async (req, res) => {

});

const deleteNote = asyncHandler(async (req, res) => {

});

module.exports = {
    getAllNotes, createNewNote, updateNote, deleteNote
}