'use strict';

const ObjectId = require('mongodb').ObjectID;

module.exports = {

  async up(db, next) {
    db.collection('characters').find({}).toArray(async (err, characters) => {
      for (let character of characters) {
        character.owner = ObjectId(character.owner);
        character.description = character.description || "";
        character.appearance = character.appearance || "";
        character.history = character.history || "";
        character.tags = character.tags || [];
        character.sheet = {
          characteristics: character.caracteristics.map(c => {
            return {
              name: c.name,
              value: c.value,
              remark: c.remark || "",
            };
          }),
          skills: character.skills.map(s => {
            return {
              name: s.name,
              value: s.value,
              remark: s.remark || "",
            };
          }),
          feats: [],
        }

        await db.collection('characters').update({ _id: character._id }, character);
      }

      await db.collection('characters').updateMany({}, { $unset: { status: 1, skills: 1, caracteristics: 1 }});
      
      await db.collection('characters').createIndex({ name: 'text' });
      await db.collection('characters').createIndex({ name: 1 }, { unique: true });
      
      next();
    });
  },

  down(db, next) {
    db.collection('characters').find({}).toArray(async (err, characters) => {
      for (let character of characters) {
        character.owner = character.owner.toString();
        character.skills = character.sheet.skills;
        character.caracteristics = character.sheet.characteristics;

        await db.collection('characters').update({ _id: character._id }, character);
      }
      
      await db.collection('characters').updateMany({}, { $unset: { sheet: 1, history: 1 }});

      await db.collection('characters').dropIndex('name_text');
      await db.collection('characters').dropIndex('name_1');

      next();
    });
  }

};