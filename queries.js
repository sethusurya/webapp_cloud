const { Sequelize, DataTypes } = require('sequelize');
const DEF = require("./definition")

const sequelize = new Sequelize('api', 'me', 'password', {
  host: 'localhost',
  dialect: 'postgres'
});

const accounts = sequelize.define('accounts', {
  // Model attributes are defined here
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4, // Or DataTypes.UUIDV1
    primaryKey: true,
    allowNull: false
  },
  first_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  last_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  account_created: {
    type: DataTypes.STRING,
    allowNull: false
  },
  account_updated: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  // Other model options go here
  freezeTableName: true,
  timestamps: false
});

sequelize.sync({ 
  force: true 
  }).then(() => {
  console.log("Drop and re-sync db.");
});

DEF.COM.SEQUELIZE = sequelize;


module.exports = {
  sequelize,
  accounts,
}