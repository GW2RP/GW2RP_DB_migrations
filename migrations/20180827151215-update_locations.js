'use strict';

const ObjectId = require('mongodb').ObjectID;

module.exports = {

  async up(db, next) {
    db.collection('locations').find({}).toArray(async (err, locations) => {
      for (let location of locations) {
        location.title = location.name;
        location.owner = ObjectId(location.owner);
        const coords = location.coord.substr(1, location.coord.length - 2).split(",");
        location.coordinates = {
          x: coords[0],
          y: coords[1],
        };
        location.description = location.description || "";
        location.opening_hours = location.hours;

        await db.collection('locations').update({ _id: location._id }, location);
      }

      await db.collection('locations').updateMany({}, { $unset: { category: 1, name: 1, coord: 1, hours: 1 }});
      
      await db.collection('locations').createIndex({ title: 'text' });
      
      next();
    });
  },

  down(db, next) {
    db.collection('locations').find({}).toArray(async (err, locations) => {
      for (let location of locations) {
        location.owner = location.owner.toString();
        location.coord = `[${location.coordinates.x},${location.coordinates.y}]`;
        location.name = location.title;
        location.hours = location.opening_hours;
        location.category = 'location';

        await db.collection('locations').update({ _id: location._id }, location);
      }
      
      await db.collection('locations').updateMany({}, { $unset: { title: 1, coordinates: 1, opening_hours: 1 }});

      await db.collection('locations').dropIndex('title_text');

      next();
    });
  }

};