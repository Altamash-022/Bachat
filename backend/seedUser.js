require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to Mongo');

    const existing = await User.findOne({ username: 'demo' });
    if (existing) {
      console.log('Demo user already exists');
      process.exit(0);
    }

    const hashed = await bcrypt.hash('demo123', 10);
    const user = new User({
      name: 'Demo User',
      username: 'demo',
      email: 'demo@example.com',
      password: hashed
    });

    await user.save();
    console.log('Demo user created: username=demo password=demo123');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
