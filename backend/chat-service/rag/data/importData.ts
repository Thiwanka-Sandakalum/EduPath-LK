import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import University from '../src/models/University';
import DegreeProgram from '../src/models/DegreeProgram';
import CourseOffering from '../src/models/CourseOffering';

const MONGO_URI = 'mongodb+srv://ict22006_db_user:BIEyqp3NdsgOoUst@development.ps1jayw.mongodb.net/education_db?appName=development';
const dataDir = __dirname;

function loadJson(filename: string) {
    const filePath = path.join(dataDir, filename);
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

async function main() {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Load data
    const universities = loadJson('university.json');
    const degreePrograms = loadJson('degree progeramms.json');
    const courseOfferings = loadJson('course offering.json');


    // Insert data with validation for universities
    await University.deleteMany({});
    await DegreeProgram.deleteMany({});
    await CourseOffering.deleteMany({});

    // Filter out invalid universities and log them
    const validUniversities = [];
    const invalidUniversities = [];
    for (const uni of universities) {
        if (uni.abbreviation) {
            validUniversities.push(uni);
        } else {
            invalidUniversities.push(uni);
        }
    }
    if (invalidUniversities.length > 0) {
        console.warn('Skipped universities missing abbreviation:', invalidUniversities.map(u => u.name || u._id));
    }
    await University.insertMany(validUniversities);
    await DegreeProgram.insertMany(degreePrograms);
    await CourseOffering.insertMany(courseOfferings);

    console.log('Data imported successfully!');
    await mongoose.disconnect();
}

main().catch((err) => {
    console.error('Error importing data:', err);
    process.exit(1);
});