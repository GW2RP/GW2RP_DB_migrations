'use strict';

const ObjectId = require('mongodb').ObjectID;

module.exports = {

  async up(db, next) {
    db.collection('guilds').find({}).toArray(async (err, guilds) => {
      for (let guild of guilds) {
        guild.owner = ObjectId(guild.owner);
        guild.summary = guild.summary || "";
        guild.description = guild.description || "";
        guild.members = [];
        guild.tags = guild.tags || [];
        guild.site = guild.site || "";

        await db.collection('guilds').update({ _id: guild._id }, guild);
      }

      await db.collection('guilds').updateMany({}, { $unset: { usual_locations: 1 }});
      
      await db.collection('guilds').ensureIndex({ name: 'text' });
      await db.collection('guilds').ensureIndex({ name: 1 }, { unique: true });
      
      next();
    });
  },

  async down(db, next) {
    db.collection('guilds').find({}).toArray(async (err, guilds) => {
      for (let guild of guilds) {
        guild.owner = guild.owner.toString();
        guild.usual_locations = [];

        await db.collection('guilds').update({ _id: guild._id }, guild);
      }
      
      await db.collection('guilds').dropIndex('name_1');

      next();
    });
  }

};