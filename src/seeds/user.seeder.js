import mongoose from "mongoose";
import connectDB from "../config/database.js";
import User from "../models/user.model.js";
import { ROLES, USER_STATUSES } from "../utils/constants.js";

const defaultUsers = [
  {
    firstName: "Hamza",
    lastName: "Admin",
    email: "admin@careflow.com",
    phone: "+10000000001",
    role: ROLES.ADMIN,
    status: USER_STATUSES.ACTIVE,
    password: "Admin@1234",
  },
  {
    firstName: "hamza",
    lastName: "doctor",
    email: "doctor@careflow.com",
    phone: "+10000000002",
    role: ROLES.DOCTOR,
    status: USER_STATUSES.ACTIVE,
    password: "Doctor@1234",
  },
  {
    firstName: "hamza",
    lastName: "patient",
    email: "patient@careflow.com",
    phone: "+10000000003",
    role: ROLES.PATIENT,
    status: USER_STATUSES.ACTIVE,
    password: "Patient@1234",
  },
  {
    firstName: "hamza",
    lastName: "nurse",
    email: "nurse@careflow.com",
    phone: "+10000000004",
    role: ROLES.NURSE,
    status: USER_STATUSES.ACTIVE,
    password: "Nurse@1234",
  },
  {
    firstName: "hamza",
    lastName: "secretary",
    email: "secretary@careflow.com",
    phone: "+10000000005",
    role: ROLES.SECRETARY,
    status: USER_STATUSES.ACTIVE,
    password: "Secretary@1234",
  }
];

async function seedUsers() {
  const connection = await connectDB();

  try {
    let upsertedCount = 0;
    for (const user of defaultUsers) {
      const passwordHash = await User.hashPassword(user.password);

      const now = new Date();
      const result = await User.updateOne(
        { email: user.email },
        {
          $set: {
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            status: user.status,
            isActive: true,
            phone: user.phone,
            email: user.email.toLowerCase(),
            updatedAt: now,
          },
          $setOnInsert: { passwordHash, createdAt: now },
        },
        { upsert: true, runValidators: true }
      );

      if (result.upsertedCount && result.upsertedCount > 0) {
        upsertedCount += result.upsertedCount;
        console.log(`Inserted user: ${user.email}`);
      } else if (result.matchedCount > 0) {
        console.log(`Updated user: ${user.email}`);
      }
    }

    console.log(`Seeding complete. Upserted: ${upsertedCount}`);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exitCode = 1;
  } finally {
    await connection.connection.close();
    await mongoose.disconnect();
  }
}

// Run
seedUsers();


