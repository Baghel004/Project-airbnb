if (process.env.NODE_ENV != "production") {
    require("dotenv").config();
}

const express = require('express');
const mongoose = require('mongoose');
const app = express();

const dbUrl = process.env.REVIEWS_DB_URL;
const reviewRouter = require('./routes/review.js');
const { metricsMiddleware, metricsHandler } = require('./utils/metrics.js');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(metricsMiddleware);
app.get('/metrics', metricsHandler);
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'review-service' }));

app.use('/', reviewRouter);

app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.status || 500).json({ error: err.message || 'internal error' });
});

const connectDb = async () => {
    try {
        await mongoose.connect(dbUrl);
        console.log("review-service: connected to db");
    } catch (err) {
        // Don't run without a DB (that causes "buffering timed out" on every request).
        // Exit so Kubernetes restarts the pod and retries the connection.
        console.error("review-service DB connection failed, exiting for restart:", err.message);
        process.exit(1);
    }
};
connectDb();
// If the connection later drops and can't recover, exit so k8s restarts us.
mongoose.connection.on('error', (err) => {
    console.error("review-service mongoose error:", err.message);
});

const PORT = process.env.PORT || 4003;
app.listen(PORT, () => {
    console.log(`review-service listening on port ${PORT}`);
});
