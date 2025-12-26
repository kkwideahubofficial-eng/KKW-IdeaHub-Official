import Achievement from '../models/Achievement.js';
import { validationResult } from 'express-validator';

// @desc    Create an achievement
// @route   POST /api/achievements
// @access  Private/Coordinator
export const createAchievement = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { title, description, date, achievedBy } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : (req.body.imageUrl || '');
    const newAchievement = new Achievement({
      title,
      description,
      date,
      achievedBy,
      imageUrl,
    });

    const achievement = await newAchievement.save();
    res.status(201).json(achievement);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get all achievements
// @route   GET /api/achievements
// @access  Public
export const getAllAchievements = async (req, res) => {
  try {
    const achievements = await Achievement.find().sort({ date: -1 });
    res.json(achievements);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get achievement by ID
// @route   GET /api/achievements/:id
// @access  Public
export const getAchievementById = async (req, res) => {
  try {
    const achievement = await Achievement.findById(req.params.id);
    if (!achievement) {
      return res.status(404).json({ message: 'Achievement not found' });
    }
    res.json(achievement);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update an achievement
// @route   PUT /api/achievements/:id
// @access  Private/Coordinator
export const updateAchievement = async (req, res) => {
  try {
    const { title, description, date, achievedBy } = req.body;
    let achievement = await Achievement.findById(req.params.id);

    if (!achievement) {
      return res.status(404).json({ message: 'Achievement not found' });
    }

    achievement.title = title || achievement.title;
    achievement.description = description || achievement.description;
    achievement.date = date || achievement.date;
    achievement.achievedBy = achievedBy || achievement.achievedBy;
    if (req.file) {
      achievement.imageUrl = `/uploads/${req.file.filename}`;
    } else if (typeof req.body.imageUrl === 'string') {
      achievement.imageUrl = req.body.imageUrl || achievement.imageUrl;
    }

    await achievement.save();
    res.json(achievement);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete an achievement
// @route   DELETE /api/achievements/:id
// @access  Private/Coordinator
export const deleteAchievement = async (req, res) => {
  try {
    const achievement = await Achievement.findById(req.params.id);

    if (!achievement) {
      return res.status(404).json({ message: 'Achievement not found' });
    }

    await achievement.deleteOne();
    res.json({ message: 'Achievement removed' });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};
