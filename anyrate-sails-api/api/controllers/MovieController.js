/**
 * MovieController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  getMovieCost: function (req, res) {
    return res.json({ unitCost: 1 });
  },
};
