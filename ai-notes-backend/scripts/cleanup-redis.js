// cleanup-redis.js
const Redis = require("ioredis");

const redis = new Redis(process.env.REDIS_URL);

async function checkAndClean() {
  try {
    const info = await redis.info("memory");
    const usedLine = info.split("\n").find(line => line.startsWith("used_memory:"));
    const maxLine = info.split("\n").find(line => line.startsWith("maxmemory:"));

    const used = parseInt(usedLine?.split(":")[1] || "0", 10);
    const max = parseInt(maxLine?.split(":")[1] || "0", 10);

    if (max === 0) {
      console.log("⚠️ Redis không có maxmemory (Upstash free tier thường vậy). Dùng TTL hoặc eviction policy.");
      return;
    }

    const percent = ((used / max) * 100).toFixed(2);
    console.log(`📊 Memory used: ${percent}% (${used}/${max} bytes)`);

    if (percent > 80) {
      console.log("⚠️ Bộ nhớ đầy, tiến hành dọn key...");

      let cursor = "0";
      do {
        const [nextCursor, keys] = await redis.scan(cursor, "MATCH", "cache:*", "COUNT", 100);
        if (keys.length > 0) {
          await redis.del(...keys);
          console.log(`🗑️ Deleted ${keys.length} keys`);
        }
        cursor = nextCursor;
      } while (cursor !== "0");

      // Hoặc xoá toàn bộ:
      // await redis.flushdb();
    }
  } catch (err) {
    console.error("❌ Lỗi khi kiểm tra/cleanup Redis:", err);
  } finally {
    redis.disconnect();
  }
}

checkAndClean().then(() => process.exit(0));
