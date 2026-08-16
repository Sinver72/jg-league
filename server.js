process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const express = require("express");
const cors = require("cors");

// Fix for node-fetch in CommonJS
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const app = express();
const PORT = 3000;

// Enable CORS for all routes
app.use(cors());
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    next();
});

// Fetch all users
app.get("/users", async (req, res) => {
    try {
        console.log("Fetching users from Jumpgate…");

        const response = await fetch("https://jumpgate-tri.org/jossh-api/all-users.json");
        console.log("Jumpgate status:", response.status);

        const users = await response.json();
        res.json(users);

    } catch (err) {
        console.error("ERROR FETCHING USERS:", err);
        res.status(500).json({ error: "Failed to fetch users" });
    }
});

// Fetch any profile (Express v4 wildcard syntax)
app.get("/profile/*", async (req, res) => {
    const profileUrl = req.params[0];

    try {
        const profile = await fetch("https://jumpgate-tri.org/" + profileUrl)
            .then(r => r.json());
        res.json(profile);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch profile" });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});