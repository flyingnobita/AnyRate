/**
 * UserController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  getCount: function (req, res) {
    User.count((err, num) => {
      if (err) {
        return console.log(err);
      }
      console.log(num);
      return res.json({ count: num });
    });
  },

  getUsageCount: async function (req, res) {
    return res.json({ count: { user1: 1, user2: 2, user3: 3 } });
  },

  getUsageCountUser1: async function (req, res) {
    return res.json({ count: 3 });
  },

  getUsageCountUser2: async function (req, res) {
    return res.json({ count: 6 });
  },
};
