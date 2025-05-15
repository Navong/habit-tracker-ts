import mongoose from "mongoose";

const habitSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    goal : {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    completed_dates: {
        type: [String],
        default: [],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

export const Habit = mongoose.model("Habit", habitSchema);