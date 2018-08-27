'use strict';

module.exports = {

  async up(db, next) {
    await db.collection('events').deleteMany({});
    next();
  },

  async down(db, next) {
    await db.collection('events').deleteMany({});
    next();
  }

};