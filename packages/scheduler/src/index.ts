import { CronJob, CronJobParams } from "cron";
import { queueScheduledCasts } from "./jobs/publish-scheduled";

const jobs: CronJobParams[] = [
  {
    cronTime: "* * * * *",
    onTick: queueScheduledCasts,
    start: true,
  },
];

for (const job of jobs) {
  CronJob.from(job);
}
