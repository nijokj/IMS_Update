module.exports = {
  HOST: "imsdb.cbakg20oyeku.ap-south-1.rds.amazonaws.com",
  USER: "IMS_Admin",
  PASSWORD: "IMS_Admin",
  DB: "invsys",
  dialect: "mysql",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
};
