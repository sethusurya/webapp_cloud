const { Sequelize, DataTypes } = require('sequelize');
const DEF = require("./definition")
require('dotenv').config()


const sequelize = new Sequelize(`${process.env.DB_NAME}`, `${process.env.DB_USER_NAME}`, `${process.env.DB_PASSWORD}`, {
  host: `${process.env.DB_ADDRESS}`,
  port: 5432,
  dialect: 'postgres',
  pool: { maxConnections: 5, maxIdleTime: 30 }
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

const documents = sequelize.define('documents', {
  doc_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4, // Or DataTypes.UUIDV1
    primaryKey: true,
    allowNull: false
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  date_created: {
    type: DataTypes.DATE,
    allowNull: false
  },
  s3_bucket_path: {
    type: DataTypes.STRING,
    allowNull: false
  },
},{
  // Other model options go here
  freezeTableName: true,
  timestamps: false
})

sequelize.sync({ 
  // force: true 
  }).then(() => {
  console.log("Drop and re-sync db.");
});

DEF.COM.SEQUELIZE = sequelize;


module.exports = {
  sequelize,
  accounts,
  documents,
}