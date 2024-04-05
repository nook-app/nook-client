import { FarcasterCacheClient, RedisClient } from "@nook/common/clients";
import { Prisma, PrismaClient } from "@nook/common/prisma/farcaster";
import { FarcasterTrendingCashtag } from "@nook/common/types";

const calculateTrendingCashtags = (
  stats: Record<string, Record<string, { all: number; powerBadge: number }>>,
) => {
  const decayRate = 0.5;
  const hoursToConsider = 6;
  const now = new Date();
  const weightedMentions: Record<string, FarcasterTrendingCashtag> = {};

  for (let i = 0; i < hoursToConsider; i++) {
    const hourTimestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
    hourTimestamp.setMinutes(0, 0, 0);
    const hourTimestampISO = hourTimestamp.toISOString();
    const hourStats = stats[hourTimestampISO];
    if (!hourStats) continue;

    const weight = decayRate ** i;
    for (const cashtag in hourStats) {
      if (!weightedMentions[cashtag]) {
        weightedMentions[cashtag] = {
          cashtag,
          score: 0,
          count6h: 0,
          powerBadgeCount6h: 0,
          count3h: 0,
          powerBadgeCount3h: 0,
          count1h: 0,
          powerBadgeCount1h: 0,
        };
      }
      weightedMentions[cashtag].score +=
        Number(hourStats[cashtag].all) *
          Number(hourStats[cashtag].powerBadge > 0 ? weight : 0.25 * weight) +
        Number(hourStats[cashtag].powerBadge) * 5;
      weightedMentions[cashtag].count6h += Number(hourStats[cashtag].all);
      weightedMentions[cashtag].powerBadgeCount6h += Number(
        hourStats[cashtag].powerBadge,
      );
      if (i < 3) {
        weightedMentions[cashtag].count3h += Number(hourStats[cashtag].all);
        weightedMentions[cashtag].powerBadgeCount3h += Number(
          hourStats[cashtag].powerBadge,
        );
      }
      if (i < 1) {
        weightedMentions[cashtag].count1h += Number(hourStats[cashtag].all);
        weightedMentions[cashtag].powerBadgeCount1h += Number(
          hourStats[cashtag].powerBadge,
        );
      }
    }
  }

  return Object.values(weightedMentions).sort((a, b) => b.score - a.score);
};

export const run = async () => {
  const client = new FarcasterCacheClient(new RedisClient());
  const prisma = new PrismaClient();

  const powerBadgeUsers = await client.getPowerBadgeUsers();

  const runForDate = async (date: Date) => {
    const getCashTagData = async (
      date: Date,
      fids?: string[],
    ): Promise<{ timestamp: Date; cashtag: string; mentions: number }[]> => {
      const startDate = date.toISOString().split("T")[0];
      const conditions: string[] = [`"parentHash" IS NULL`];
      conditions.push(`"timestamp" >= '${startDate}'`);

      if (fids) {
        conditions.push(
          `"fid" IN (${fids.map((fid) => BigInt(fid)).join(",")})`,
        );
      }

      return await prisma.$queryRaw(
        Prisma.sql([
          `SELECT date_trunc('hour', "timestamp") AS timestamp, LOWER(cashtag) AS cashtag, COUNT(*) AS mentions
                FROM (
                    SELECT unnest(regexp_matches("text", '\\$\\w+', 'gi')) AS cashtag, "timestamp"
                    FROM "FarcasterCast"
                    WHERE ${conditions.join(" AND ")}
                ) AS cashtags
                GROUP BY 1, 2`,
        ]),
      );
    };

    const allData = await getCashTagData(date);
    const powerBadgeData = await getCashTagData(date, powerBadgeUsers);

    const stats: Record<
      string,
      Record<string, { all: number; powerBadge: number }>
    > = {};
    for (const data of allData) {
      if (
        data.cashtag.length <= 2 ||
        !Number.isNaN(Number(data.cashtag.slice(1, 2)))
      ) {
        continue;
      }

      if (!stats[data.timestamp.toISOString()]) {
        stats[data.timestamp.toISOString()] = {};
      }
      if (!stats[data.timestamp.toISOString()][data.cashtag]) {
        stats[data.timestamp.toISOString()][data.cashtag] = {
          all: 0,
          powerBadge: 0,
        };
      }
      stats[data.timestamp.toISOString()][data.cashtag].all = data.mentions;
    }

    for (const data of powerBadgeData) {
      if (
        data.cashtag.length <= 2 ||
        !Number.isNaN(Number(data.cashtag.slice(1, 2)))
      ) {
        continue;
      }

      stats[data.timestamp.toISOString()][data.cashtag].powerBadge =
        data.mentions;
    }

    const values = Object.entries(stats)
      .flatMap(([timestamp, cashtags]) =>
        Object.entries(cashtags).map(([cashtag, { all, powerBadge }]) => {
          // Ensure cashtag starts with $ and is followed by alphanumeric characters
          const validCashtag = cashtag.match(/^\$\w+$/);
          if (!validCashtag) {
            // Skip this cashtag or handle it as needed
            return null;
          }
          // Proceed with the valid cashtag
          return `('${timestamp}', '${cashtag.replaceAll(/'/g, "''")}', ${
            all || 0
          }, ${powerBadge || 0})`;
        }),
      )
      .filter(Boolean)
      .join(", ");

    const chunkSize = 1000;
    const valuesArray = values.split(", ");
    for (let i = 0; i < valuesArray.length; i += chunkSize) {
      if (i + chunkSize > valuesArray.length) {
        break;
      }
      const chunk = valuesArray.slice(i, i + chunkSize).join(", ");
      const sqlQuery = `
        INSERT INTO "FarcasterCashtagStats" ("timestamp", "cashtag", "count", "powerBadgeCount")
        VALUES ${chunk}
        ON CONFLICT ("timestamp", "cashtag") DO UPDATE
        SET "count" = EXCLUDED."count",
            "powerBadgeCount" = EXCLUDED."powerBadgeCount";
        `;

      await prisma.$executeRawUnsafe(sqlQuery);
    }

    console.log(`Inserted data since ${date.toISOString().split("T")[0]}`);
    return stats;
  };

  const backfillStartDate = new Date();
  backfillStartDate.setDate(backfillStartDate.getDate() - 1);
  const stats = await runForDate(backfillStartDate);
  const trendingCashtags = calculateTrendingCashtags(stats);
  await client.setTrendingCashtags(trendingCashtags.slice(0, 50));

  console.log(trendingCashtags.slice(0, 10));
};

run()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
