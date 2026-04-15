import { Worker } from 'bullmq';
import { processMetricJob } from './worker.js';

const connection = new IORedis();

const worker = new Worker('metric-queue', async job => {

    const { metric, user_id, work_id } = job.data;

    await processMetricJob(metric, user_id, work_id);

}, { connection });

worker.on('completed', () => {
    console.log("Job done");
});

worker.on('failed', err => {
    console.error("Job failed:", err);
});