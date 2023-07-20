const express = require('express');
const app = express();
const path = require('path');
const PORT = process.env.PORT || 3500;

// Url encoded data
app.use(express.urlencoded({ extended: false }));

// Built-in json middleware
app.use(express.json());

// Serving static files
app.use('/', express.static(path.join(__dirname, 'public')));

// Routes
app.use('/', require('./routes/root'));

app.all('*', (req, res) => {
    res.status(404);
    if (req.accepts('html')) {
        res.status(404).sendFile(path.join(__dirname, 'views', '404.html'));
    } else if (req.accepts('json')) {
        res.json({ error: '404 not found' });
    } else {
        res.type('txt').send('404 not found');
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));