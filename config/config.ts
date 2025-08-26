// config.ts
const config = {
    port: parseInt( "8000"),
    db: {
        uri: "mongodb://localhost:27017/GameData",
        options: {
            user: process.env.DB_USER || "MongoDB",
            pass: process.env.DB_PASS || "1",
        }
    },

    // jwtSecret: process.env.JWT_SECRET || "defaultSecret",
};

export default config;