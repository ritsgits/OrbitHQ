import mongoose from 'mongoose';
import User from './models/User.ts';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function findUser() {
  await mongoose.connect(process.env.MONGODB_URI!);
  const user = await User.findOne({});
  console.log('Found user:', user?.email);
  process.exit(0);
}

findUser();
