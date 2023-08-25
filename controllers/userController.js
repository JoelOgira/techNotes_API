const User = require('../models/User');
const Note = require('../models/Note');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');

// @desc Get all users
// @route GET /users
// @access Private
const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find().select('-password').lean();
    if (!users?.length) {
        return res.status(400).json({ Message: "No Users Found" });
    }
    res.json(users)
});

// @desc create new users
// @route POST /users
// @access Private  
const createNewUser = asyncHandler(async (req, res) => {
    const { username, password, roles } = req.body;

    // Confirm data
    if (!username || !password || !Array.isArray(roles) || !roles.length) {
        return res.status(400).json({ Message: "All fields are required" });
    }

    // Check for duplicates
    const duplicate = await User.findOne({ username }).lean().exec();

    if (duplicate) {
        return res.status(409).json({ Message: "Duplicate username" });
    }

    // Hash Password
    const hashedPwd = await bcrypt.hash(password, 10);

    const userObject = { username, "password": hashedPwd, roles };

    // Create and store new user
    const user = await User.create(userObject);

    if (user) {
        res.status(201).json({ Message: `User ${username} created` });
    } else {
        res.status(400).json({ Message: `Invalid user data received` });
    }

});

// @desc update a user
// @route PATCH /users
// @access Private
const updateUser = asyncHandler(async (req, res) => {
    const { id, username, roles, active, password } = req.body;

    // Confirm data
    if (!id || !username || !Array.isArray(roles) || !roles.length || typeof active !== 'boolean') {
        return res.status(400).json({ Message: "All fields required" });
    }

    const user = await User.findById(id).exec();

    if (!user) {
        return res.status(400).json({ Message: "User not found" });
    }

    // Check for Duplicate
    const duplicate = await User.findOne({ username }).lean().exec();    
    // Allow updates to the original user
    if (duplicate && duplicate?._id.toString() !== id) {
        return res.status(409).json({ Message: "Duplicate username" });
    }

    user.username = username;
    user.roles = roles;
    user.active = active;

    if (password) {
        user.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await user.save();

    res.json({ Message: `${updatedUser.username} updated` });
});

// @desc delete a user
// @route DELETE /users
// @access Private
const deleteUser = asyncHandler(async (req, res) => {
    const {id} = req.body;

    if (!id) {
        return res.status(400).json({Message: 'User ID required'});
    }

    const note = await Note.findOne({ user: id }).lean().exec();
    if (note) {
        return res.status(400).json({ Message: "User has assigned notes" });
    }

    const user = await User.findById(id).exec();

    if (!user) {
        return res.status(400).json({ Message: "User not found" });
    }

    const result = await user.deleteOne();

    const reply = `Username ${result.username} with ID ${result._id} deleted`;

    res.json(reply);

});

module.exports = {
    getAllUsers, createNewUser, updateUser, deleteUser
}

