const express = require('express');
const router = express.Router();
const notesController = require('../controllers/notesController');

router.route('/')
    .get(notesController.getAllNotes)
    // .post(notesController)
    // .patch(notesController)
    // .delete(notesController)

module.exports = router;
