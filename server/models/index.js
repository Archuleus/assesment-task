const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../database.sqlite'),
  logging: false
});

const User = require('./User')(sequelize);
const NFT = require('./NFT')(sequelize);

module.exports = { sequelize, User, NFT };
