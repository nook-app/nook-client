import { PrismaClient } from "@nook/common/prisma/farcaster";
const fs = require("fs");
const path = require("path");

const importCsv = (filePath: string) => {
  const data = fs.readFileSync(filePath, { encoding: "utf-8" });
  const lines = data.split("\n").filter((line: string) => line);
  const headers = lines.shift().split(",");

  return lines.map((line: string) => {
    const values = line.split(",");
    return headers.reduce(
      (obj: Record<string, string>, header: string, index: number) => {
        obj[header] = values[index];
        return obj;
      },
      {},
    );
  });
};

const getCountForSignersOnDate = async (
  client: PrismaClient,
  date: Date,
  signers?: string[],
) => {
  const nextDay = new Date(date);
  nextDay.setDate(date.getDate() + 1);
  return await client.farcasterCast.count({
    where: {
      timestamp: {
        gt: date,
        lt: nextDay,
      },
      signer: signers
        ? {
            in: signers,
          }
        : undefined,
    },
  });
};

export const run = async () => {
  const client = new PrismaClient();

  const resultsArray = importCsv(path.join(__dirname, "dune", "results.csv"));
  const signersByApp: Record<string, string[]> = resultsArray.reduce(
    (acc: Record<string, string[]>, result: Record<string, string>) => {
      const { appfid, pubkey } = result;
      if (!acc[appfid]) {
        acc[appfid] = [];
      }
      acc[appfid].push(pubkey);
      return acc;
    },
    {} as Record<string, string[]>,
  );

  const relevantApps = [];
  for (const [appfid, signers] of Object.entries(signersByApp)) {
    if (signers.length < 100) {
      continue;
    }
    relevantApps.push(appfid);
  }

  console.log(relevantApps);
  console.log(signersByApp["193137"].length);
  console.log(signersByApp["262426"].length);

  const dates = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    dates.push(date);
  }

  console.log("getting total counts");
  const totalCounts = await Promise.all(
    dates.map(async (date) => {
      return await getCountForSignersOnDate(client, date);
    }),
  );

  console.log("getting supercast counts");
  const supercastCounts = await Promise.all(
    dates.map(async (date) => {
      return await getCountForSignersOnDate(
        client,
        date,
        signersByApp["193137"],
      );
    }),
  );

  console.log("getting nook counts");
  const nookCounts = await Promise.all(
    dates.map(async (date) => {
      return await getCountForSignersOnDate(
        client,
        date,
        signersByApp["262426"],
      );
    }),
  );

  for (let i = 0; i < dates.length; i++) {
    console.log(
      `${dates[i].toISOString().split("T")[0]} - all:${totalCounts[i]}, nook:${
        nookCounts[i]
      } (${((nookCounts[i] / totalCounts[i]) * 100).toFixed(6)}%), supercast:${
        supercastCounts[i]
      } (${((supercastCounts[i] / totalCounts[i]) * 100).toFixed(6)}%)`,
    );
  }
};

run()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
