'use strict';

const ObjectId = require('mongodb').ObjectID;

module.exports = {

  async up(db, next) {
    db.collection('events').find({}).toArray(async (err, events) => {
      for (let event of events) {
        event.title = event.name;
        event.owner = ObjectId(event.owner);
        const coords = event.coord.substr(1, event.coord.length - 2).split(",");
        event.coordinates = {
          x: coords[0],
          y: coords[1],
        };
        event.description = event.description || "";
        event.dates = {
          start: event.end_date,
          end: event.end_date,
        };
        event.participants = [];

        await db.collection('events').update({ _id: event._id }, event);
      }

      await db.collection('events').updateMany({}, { $unset: { category: 1, name: 1, coord: 1, end_date: 1 }});
      
      await db.collection('events').createIndex({ title: 'text' });
      
      next();
    });
  },

  down(db, next) {
    db.collection('events').find({}).toArray(async (err, events) => {
      for (let event of events) {
        event.owner = event.owner.toString();
        event.coord = `[${event.coordinates.x},${event.coordinates.y}]`;
        event.name = event.title;
        event.end_date = event.dates.start;
        event.category = 'location';
        event.participants = [];

        await db.collection('events').update({ _id: event._id }, event);
      }

      await db.collection('events').dropIndex('title_text');
      
      await db.collection('events').updateMany({}, { $unset: { title: 1, coordinates: 1, dates: 1 }});

      next();
    });
  }

};