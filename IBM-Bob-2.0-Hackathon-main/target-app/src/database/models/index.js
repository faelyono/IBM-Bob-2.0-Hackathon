'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');

// Reuse the single shared instance from config/sequelize.js instead of
// creating a second, disconnected Sequelize instance
const sequelizeModule = require('../config/sequelize');
const sequelize = sequelizeModule.default || sequelizeModule;

const db = {};
const basename = path.basename(__filename);

fs.readdirSync(__dirname)
  .filter((file) => file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js')
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;