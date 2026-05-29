const queue = [];
let isProcessing = false;

export const pushToQueue = (job) => {
    queue.push(job);
    processQueue();
};

const processQueue = async () => {
    if (isProcessing) return;
    isProcessing = true;

    while (queue.length > 0) {
        const job = queue.shift();
        try {
            await job();
        } catch (err) {
            console.error("QUEUE JOB ERROR:", err);
        }
    }

    isProcessing = false;
};