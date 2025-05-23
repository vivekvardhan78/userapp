const express = require('express');
const mongoose = require('mongoose');
const User = require('./models/User');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const session = require('express-session');

const app = express();
mongoose.connect('mongodb://localhost:27017/userAuth');

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: 'secretkey', resave: false, saveUninitialized: true }));
app.use(express.static('public'));

app.post('/signup', async (req, res) => {
    const { firstName, lastName, email, phone, password, pincode, dob, address } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        const user = new User({ firstName, lastName, email, phone, password: hashedPassword, pincode, dob, address });
        await user.save();
        res.send("Signup successful");
    } catch (err) {
        res.status(400).send("Email already exists");
    }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).send("Invalid email");

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).send("Invalid password");

    req.session.user = user;
    res.json(user);
});

app.get('/dashboard', (req, res) => {
    if (!req.session.user) return res.status(401).send("Unauthorized");
    res.json(req.session.user);
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));