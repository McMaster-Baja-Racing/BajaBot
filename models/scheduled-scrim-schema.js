//This file will define the database entry format for use in mongoose

const mongoose = require('mongoose');

//Base required string
const reqString = {
    type: String,
    required: true,
}

const scheduledSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true
    },
    content: reqString,
    channel: reqString,
    role: reqString,
}, { timestamps: true });

const ScheduledScrim = mongoose.model('Scrims', scheduledSchema);

module.exports = ScheduledScrim;