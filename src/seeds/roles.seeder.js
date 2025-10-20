import mongoose from "mongoose";
import connectDB from "../config/database.js";
import rolesRepo from "../repositories/role.repository.js";
import { DEFAULT_ROLES } from "../config/rbac.defaults.js";

async function seedRoles() {
  const connection = await connectDB();
  try {
    await rolesRepo.upsertMany(DEFAULT_ROLES);
    console.log(`Seeded roles: ${DEFAULT_ROLES.map(r => r.name).join(", ")}`);
  } catch (err) {
    console.error("Seeding roles failed:", err);
    process.exitCode = 1;
  } finally {
    await connection.connection.close();
    await mongoose.disconnect();
  }
}

seedRoles();
