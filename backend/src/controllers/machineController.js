import Machine from '../models/Machine.js';
import { validationResult } from 'express-validator';

export async function createMachine(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const { name, summary, details } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : (req.body.imageUrl || '');
    const machine = await Machine.create({ name, summary, details, imageUrl });
    return res.status(201).json(machine);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to create machine', error: err.message });
  }
}

export async function listMachines(_req, res) {
  try {
    const machines = await Machine.find().sort({ createdAt: -1 });
    return res.status(200).json(machines);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch machines', error: err.message });
  }
}

export async function deleteMachine(req, res) {
  try {
    const { id } = req.params;
    const machine = await Machine.findById(id);
    if (!machine) return res.status(404).json({ message: 'Machine not found' });
    await machine.deleteOne();
    return res.status(200).json({ message: 'Machine removed' });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to delete machine', error: err.message });
  }
}

export default { createMachine, listMachines, deleteMachine };


