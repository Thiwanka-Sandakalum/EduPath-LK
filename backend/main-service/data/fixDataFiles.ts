import fs from 'fs';
import path from 'path';

const dataDir = __dirname;

// 1. Fix university.json: add abbreviation if missing (use unicode_suffix or fallback)
function fixUniversities() {
    const filePath = path.join(dataDir, 'university.json');
    const universities = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const valid = [];
    const invalid = [];
    for (const uni of universities) {
        if (!uni.abbreviation) {
            if (uni.unicode_suffix) {
                uni.abbreviation = uni.unicode_suffix;
            } else if (uni.name) {
                uni.abbreviation = uni.name.substring(0, 3).toUpperCase();
            } else {
                uni.abbreviation = 'UNK';
            }
        }
        const hasType = !!uni.type;
        const hasContact = !!uni.contact && !!uni.contact.address && !!uni.contact.website;
        if (hasType && hasContact) {
            valid.push(uni);
        } else {
            invalid.push(uni);
        }
    }
    fs.writeFileSync(filePath, JSON.stringify(valid, null, 2));
    if (invalid.length > 0) {
        console.warn('Skipped universities missing required fields:', invalid.map(u => u.name || u._id));
    }
    console.log('Fixed university.json');
}

// 2. Fix course offering.json: rename cutoff_marks_2023_2024 to cutoff_marks, add academic_year, remove course_name/university_name
function fixCourseOfferings() {
    const filePath = path.join(dataDir, 'course offering.json');
    const offerings = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    for (const offer of offerings) {
        if (offer.cutoff_marks_2023_2024) {
            offer.cutoff_marks = offer.cutoff_marks_2023_2024;
            delete offer.cutoff_marks_2023_2024;
        }
        if (!offer.academic_year) {
            offer.academic_year = '2023/2024';
        }
        delete offer.course_name;
        delete offer.university_name;
    }
    fs.writeFileSync(filePath, JSON.stringify(offerings, null, 2));
    console.log('Fixed course offering.json');
}

fixUniversities();
fixCourseOfferings();