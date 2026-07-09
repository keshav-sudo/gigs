import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';

const seedDefaultUser = async (): Promise<void> => {
  try {
    const defaultEmail = 'demo@gigcraft.com';
    const existing = await User.findOne({ email: defaultEmail });
    if (!existing) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('password123', salt);
      const user = new User({
        email: defaultEmail,
        passwordHash,
        name: 'Demo Freelancer'
      });
      await user.save();
      console.log('Default demo user seeded: demo@gigcraft.com / password123');
    }
  } catch (err) {
    console.error('Failed to seed default user:', err);
  }
};

export const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('Error: MONGODB_URI environment variable is not defined.');
      process.exit(1);
    }

    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Seed the demo user
    await seedDefaultUser();
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${(error as Error).message}`);
    process.exit(1);
  }
};
