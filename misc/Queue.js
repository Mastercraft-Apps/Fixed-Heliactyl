class Queue {
    constructor() {
        this.queue = [];
        this.processing = false;
    }

    addJob(job) {
        this.queue.push(job);
        if (!this.processing) {
            this.processQueue();
        }
    }

    async processQueue() {
        if (this.processing) return;

        const job = this.queue.shift();
        if (!job) return;

        this.processing = true;

        try {
            await job();
        } catch (error) {
            console.error(`Error executing job: ${error}`);
        } finally {
            this.processing = false;
            this.processQueue();
        }
    }
}

module.exports = Queue;
