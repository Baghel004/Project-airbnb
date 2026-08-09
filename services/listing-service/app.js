if (process.env.NODE_ENV != "production") {
    require("dotenv").config();
}

const express = require('express');
const mongoose = require('mongoose');
const app = express();

const dbUrl = process.env.LISTINGS_DB_URL;
const listingRouter = require('./routes/listing.js');
const { metricsMiddleware, metricsHandler } = require('./utils/metrics.js');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(metricsMiddleware);
app.get('/metrics', metricsHandler);
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'listing-service' }));

app.use('/listings', listingRouter);

app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.status || 500).json({ error: err.message || 'internal error' });
});

const connectDb = async () => {
    try {
        await mongoose.connect(dbUrl);
        console.log("listing-service: connected to db");
    } catch (err) {
        console.error("listing-service DB connection failed, exiting for restart:", err.message);
        process.exit(1);
    }
};
connectDb();
mongoose.connection.on('error', (err) => {
    console.error("listing-service mongoose error:", err.message);
});

const PORT = process.env.PORT || 4002;
app.listen(PORT, () => {
    console.log(`listing-service listening on port ${PORT}`);
});
