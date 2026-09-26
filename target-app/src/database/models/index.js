<<<<<<< HEAD
console.log('this is placeholder for models');
=======
'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
require('dotenv').config();

// Determine the correct DATABASE_URL based on NODE_ENV
const env = process.env.NODE_ENV || 'development';
const urlMap = {
  development: process.env.DEV_DATABASE_URL,
  test: process.env.TEST_DATABASE_URL,
  production: process.env.DATABASE_URL,
};
const databaseUrl = urlMap[env];

// Create sequelize instance from connection string
const sequelize = new Sequelize(String(databaseUrl), {
  dialect: 'postgres',
  logging: env === 'development' ? console.log : false,
  pool: { min: 0, max: 5 },
  define: {
    underscored: false,
    freezeTableName: true,
  },
});

const db = {};
const basename = path.basename(__filename);

// Automatically load every model file in this directory (except this index)
fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js'
    );
  })
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

// Wire up associations if each model defines an associate() method
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
>>>>>>> 0f49992 (Adding new things yoyo)
