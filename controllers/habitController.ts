import { Request, Response } from "express";
import { Habit } from "../models/habit";
import { redisClient } from "../libs/redis";

const getHabits = async (req: Request, res: Response) => {
    try {
        let habits = null
        const cachedHabits = await redisClient.get('habits');

        if (cachedHabits) {
            habits = JSON.parse(cachedHabits);
            console.log("Cached hits");
        } else {
            habits = await Habit.find();
            await redisClient.set('habits', JSON.stringify(habits), { EX: 300 });
        }

        // const habits = await Habit.find();
        res.json(habits);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}

const createHabit = async (req: Request, res: Response) => {

    try {
        const { name, description, goal, category, completed_dates } = req.body;

        if (!name || !goal || !category) {
            res.status(400).json({ error: "All fields are required" });
            return;
        }

        const habit = new Habit({ name, description, goal, category, completed_dates });
        await habit.save();

        await redisClient.del('habits');

        res.status(201).json(habit);

    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}

// create multiple habits
const createMultipleHabits = async (req: Request, res: Response) => {
    try {
        const habits = req.body;

        // console.log(habits);

        if (!habits || !Array.isArray(habits)) {
            res.status(400).json({ error: "Invalid input: 'habits' array is required." });
            return;
        }

        // Validate each habit
        const invalidHabit = habits.find(habit =>
            !habit.name || !habit.goal || !habit.category
        );

        if (invalidHabit) {
            res.status(400).json({ error: "Each habit must have 'name', 'goal', and 'category'." });
            return;
        }

        const createdHabits = await Habit.insertMany(habits);

        // Invalidate cache
        await redisClient.del('habits');

        res.status(201).json(createdHabits);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};


const updateHabit = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, description, goal, category } = req.body;

        if (!name || !goal || !category) {
            res.status(400).json({ error: "All fields are required" });
            return;
        }

        const habit = await Habit.findById(id);
        if (!habit) {
            res.status(404).json({ error: "Habit not found" });
            return;
        }
        habit.name = name;
        habit.description = description;
        habit.goal = goal;
        habit.category = category;
        await habit.save();

        await redisClient.del('habits');

        res.json(habit);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}

const deleteHabit = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const habit = await Habit.findByIdAndDelete(id);
        if (!habit) {
            res.status(404).json({ error: "Habit not found" });
            return;
        }

        await redisClient.del('habits');

        res.status(200).json({ message: `Habit ${habit.name} deleted successfully` });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}

const toggleHabit = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        let { date } = req.body;

        if (!date) {
            res.status(400).json({ error: "Date is required" });
            return;
        }

        // Normalize date to YYYY-MM-DD
        const normalizedDate = new Date(date).toISOString().split("T")[0];

        const habit = await Habit.findById(id);
        if (!habit) {
            res.status(404).json({ error: "Habit not found" });
            return;
        }

        // Normalize all existing dates in habit.completed_dates
        const completedDates = habit.completed_dates.map((d: any) =>
            new Date(d.toString()).toISOString().split("T")[0]
        );

        if (completedDates.includes(normalizedDate)) {
            habit.completed_dates = habit.completed_dates.filter((d: any) =>
                new Date(d.toString()).toISOString().split("T")[0] !== normalizedDate
            );

            // .filter(...) keeps only the dates that are not equal to the one we’re toggling.
        } else {
            habit.completed_dates.push(normalizedDate);
        }

        await habit.save();
        await redisClient.del('habits');
        res.json(habit);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}

export {
    getHabits,
    createHabit,
    updateHabit,
    deleteHabit,
    toggleHabit,
    createMultipleHabits
}