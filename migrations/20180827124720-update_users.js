'use strict';

module.exports = {

  async up(db, next) {
    db.collection('users').find({}).toArray(async (err, users) => {
      for (let user of users) {
        user.username = user.nick_name.toLowerCase();
        user.gw2_account = user.gw2_account + "." + user.gw2_id;
        user.validation_token = null;
        user.status = user.active ? 'active' : 'validation';
        user.subscriptions = { email: { expirations: false }};
        await db.collection('users').update({ _id: user._id }, user);
      }

      await db.collection('users').updateMany({}, { $unset: { nick_name: 1, gw2_id: 1, active: 1 }});
      
      await db.collection('users').createIndex({ username: 'text' });
      await db.collection('users').createIndex({ username: 1 }, { unique: true });

      next();
    });
  },

  down(db, next) {
    db.collection('users').find({}).toArray(async (err, users) => {
      for (let user of users) {
        user.nick_name = user.username;
        user.gw2_id = user.gw2_account.split('.')[1];
        user.gw2_account = user.gw2_account.split(".")[0]
        user.active = user.status === 'active';
        await db.collection('users').update({ _id: user._id }, user);
      }
      
      await db.collection('users').dropIndex('username_text');
      await db.collection('users').dropIndex('username_1');

      await db.collection('users').updateMany({}, { $unset: { username: 1, status: 1, subscriptions: 1, validation_token: 1 }});

      next();
    });
  }

};