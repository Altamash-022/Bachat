const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
const authRoutes = require("./routes/auth");

app.use("/api/auth", authRoutes);

mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log('MongoDB Connected');
})
.catch((err) => {
    console.log(err);
});

app.get('/', (req, res) => {
    res.send('Backend Running');
});

app.listen(5000, "0.0.0.0", () => {
    console.log("Server running on port 5000");
});