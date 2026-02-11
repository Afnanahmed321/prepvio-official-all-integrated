import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from "./Models/User.js";

dotenv.config();

const checkUser = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB:", process.env.MONGO_URI);

        const users = await User.find({ role: "admin" });
        console.log("Admin Users found:", users.length);
        users.forEach(u => {
            console.log(`- Name: ${u.name}, Email: ${u.email}, UserId: ${u.userId}, Role: ${u.role}`);
        });

        const prv001 = await User.findOne({ userId: "PRV001" }).select("+password");
        if (prv001) {
            console.log("Found PRV001 specifically. Has password?", !!prv001.password);
            console.log("Password hash (partial):", prv001.password ? prv001.password.substring(0, 10) : "N/A");
            console.log("Role:", prv001.role);
        } else {
            console.log("Did NOT find PRV001 by userId.");
        }

    } catch (error) {
        console.error("Check failed:", error);
    } finally {
        await mongoose.connection.close();
    }
};

checkUser();