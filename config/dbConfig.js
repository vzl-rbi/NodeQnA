export const dbConfig = {
  HOST: "switchyard.proxy.rlwy.net",
  USER: "root",
  PASSWORD: "ReDWpGhmneMBzpUKeRhnCksnPeknwYky",
  DB: "railway",
  dialect: "mysql",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
};
