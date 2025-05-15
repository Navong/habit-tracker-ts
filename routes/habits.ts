import e, { Router } from "express";
import { Request, Response } from "express";
import { Habit } from "../models/habit";
import { getHabits, createHabit, updateHabit, deleteHabit, toggleHabit, createMultipleHabits } from "../controllers/habitController";

const router = Router()


router.get("/", getHabits)
router.post("/", createHabit)
router.post("/multi", createMultipleHabits)

// edit habit
router.put("/:id", updateHabit)

// delete habit
router.delete("/:id", deleteHabit)

// toggle habit
router.put("/:id/toggle", toggleHabit)



// router.post("/", habitController.createHabit)
// router.put("/:id", habitController.updateHabit)
// router.delete("/:id", habitController.deleteHabit)

export default router