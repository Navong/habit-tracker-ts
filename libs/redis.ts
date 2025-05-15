import { createClient } from "redis";
import dotenv from "dotenv";
dotenv.config();


export const redisClient = createClient({
    url: process.env.REDIS_URL,
});


export const connectRedis = async () => {
    try {

        redisClient.on('error', err => console.log('Redis Client Error', err));
        redisClient.on('connect', () => console.log('Redis Client Connected'));

        await redisClient.connect();
        await redisClient.ping();
        await redisClient.flushAll();

    } catch (error) {
        console.error("Error connecting to Redis:", error);
    }
}

// export { connectRedis, redisClient } 