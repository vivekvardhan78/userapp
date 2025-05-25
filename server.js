const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const User = require('./models/User');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// MongoDB Connection and Start Server
mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('✅ MongoDB connected');

    // Session Setup
    app.use(session({
        secret: process.env.SESSION_SECRET || 'secretkey',
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
            client: mongoose.connection.getClient(),
            collectionName: 'sessions'
        }),
        cookie: {
            maxAge: 1000 * 60 * 60 * 24 // 1 day
        }
    }));

    // Routes
    app.post('/signup', async (req, res) => {
        const { firstName, lastName, email, phone, password, pincode, dob, address } = req.body;
        try {
            const existingUser = await User.findOne({ email });
            if (existingUser) return res.status(400).send("Email already exists");

            const hashedPassword = await bcrypt.hash(password, 10);
            const user = new User({ firstName, lastName, email, phone, password: hashedPassword, pincode, dob, address });
            await user.save();
            res.send("Signup successful");
        } catch (err) {
            console.error(err);
            res.status(500).send("Server error");
        }
    });

    app.post('/login', async (req, res) => {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(401).send("Invalid email");

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(401).send("Invalid password");

        req.session.user = {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone
        };

        res.json(req.session.user);
    });

   app.get('/dashboard', async (req, res) => {
    if (!req.session.user || !req.session.user.id) {
        return res.status(401).send("Unauthorized");
    }

    try {
        const user = await User.findById(req.session.user.id);
        if (!user) return res.status(404).send("User not found");

        res.json({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
            pincode: user.pincode,
            dob: user.dob,
            address: user.address
        });
    } catch (err) {
        console.error("Error fetching user:", err);
        res.status(500).send("Server error");
    }
});


    app.post('/logout', (req, res) => {
        req.session.destroy(err => {
            if (err) return res.status(500).send("Logout failed");
            res.send("Logged out");
        });
    });

    app.listen(process.env.PORT, () => console.log('🚀 Server running at http://localhost:3000'));
}).catch(err => console.error('❌ MongoDB connection error:', err));