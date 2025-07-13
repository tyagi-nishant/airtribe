const express = require('express');
const router = express.Router();

// Access in-memory events (passed from index.js)
let events;

// Initialize with events array
module.exports = (eventStore) => {
  events = eventStore;

  // GET /events - List all events (open to authenticated users)
  router.get('/', (req, res) => {
    res.json(events);
  });

  // POST /events - Create new event (organizer only)
  router.post('/', (req, res) => {
    if (req.user.role !== 'organizer') {
      return res.status(403).json({ message: 'Unauthorized: Organizers only' });
    }
    const { date, time, description } = req.body;
    if (!date || !time || !description) {
      return res.status(400).json({ message: 'Invalid input' });
    }
    const newEvent = {
      id: events.length + 1,
      date,
      time,
      description,
      participants: [] // Empty array for now
    };
    events.push(newEvent);
    res.status(201).json({ message: 'Event created', event: newEvent });
  });

  // PUT /events/:id - Update event (organizer only)
  router.put('/:id', (req, res) => {
    if (req.user.role !== 'organizer') {
      return res.status(403).json({ message: 'Unauthorized: Organizers only' });
    }
    const eventId = parseInt(req.params.id);
    const event = events.find(e => e.id === eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    const { date, time, description } = req.body;
    if (date) event.date = date;
    if (time) event.time = time;
    if (description) event.description = description;
    res.json({ message: 'Event updated', event });
  });

  // DELETE /events/:id - Delete event (organizer only)
  router.delete('/:id', (req, res) => {
    if (req.user.role !== 'organizer') {
      return res.status(403).json({ message: 'Unauthorized: Organizers only' });
    }
    const eventId = parseInt(req.params.id);
    const index = events.findIndex(e => e.id === eventId);
    if (index === -1) {
      return res.status(404).json({ message: 'Event not found' });
    }
    events.splice(index, 1);
    res.json({ message: 'Event deleted' });
  });

  return router;
}; 