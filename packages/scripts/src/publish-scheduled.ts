// import { SignerAPIClient } from "@nook/common/clients";
// import { PrismaClient } from "@nook/common/prisma/nook";

// const BATCH_SIZE = 100;

// const publishScheduledCasts = async () => {
//   const signerService = new SignerAPIClient();
//   const prismaClient = new PrismaClient();
//   await prismaClient.$connect();

//   let batchNum = 0;
//   let numProcessed = 0;
//   let numErrors = 0;
//   while (true) {
//     batchNum++;
//     const time = new Date();
//     const scheduledCasts = await prismaClient.pendingCast.findMany({
//       where: {
//         scheduledFor: { not: null, lt: time },
//         publishedAt: null,
//         attemptedAt: null,
//       },
//       take: BATCH_SIZE,
//     });
//     if (scheduledCasts.length === 0) {
//       break;
//     }
//     try {
//       const responses = await signerService.submitScheduledCasts({
//         data: scheduledCasts,
//       });

//       // update with published
//       const successes = responses.filter((x) => x[1] !== null);
//       const errors = responses.filter((x) => x[1] === null);
//       console.log("updating pending casts table");

//       await prismaClient.pendingCast.updateMany({
//         where: { id: { in: successes.map((x) => x[0]) } },
//         data: { publishedAt: time },
//       });
//       await prismaClient.pendingCast.updateMany({
//         where: { id: { in: errors.map((x) => x[0]) } },
//         data: { attemptedAt: time },
//       });
//       numProcessed += successes.length;
//       numErrors += errors.length;
//     } catch (err) {
//       console.error(err);
//       process.exit(1);
//     }
//   }
//   console.log(
//     `Published ${numProcessed} scheduled casts in ${batchNum} batches, and skipped ${numErrors}`,
//   );
//   await prismaClient.$disconnect();
// };

// publishScheduledCasts()
//   .catch((err) => {
//     console.error(err);
//     process.exit(1);
//   })
//   .finally(() => {
//     process.exit(0);
//   });
