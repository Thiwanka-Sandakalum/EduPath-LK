import mongoose from 'mongoose';
import Institution from '../src/models/Institution';
import Program from '../src/models/Program';
import fs from 'fs';
import path from 'path';

async function exportInstitutionsWithPrograms() {
    await mongoose.connect('mongodb+srv://ict22006_db_user:BIEyqp3NdsgOoUst@development.ps1jayw.mongodb.net/education_db?appName=development');
    const institutions = await Institution.find().lean();
    const programs = await Program.find().lean();

    // Group programs by institution_id
    const programsByInstitution: Record<string, any[]> = {};
    for (const program of programs) {
        if (!programsByInstitution[program.institution_id]) {
            programsByInstitution[program.institution_id] = [];
        }
        programsByInstitution[program.institution_id].push(program);
    }

    let output = '';
    for (const institution of institutions) {
        output += `Institution:\n`;
        for (const [key, value] of Object.entries(institution)) {
            if (key === '_id' || key === '__v') continue;
            output += `  ${key}: ${JSON.stringify(value)}\n`;
        }
        const instPrograms = programsByInstitution[institution._id?.toString()] || [];
        if (instPrograms.length > 0) {
            output += `  Programs:\n`;
            for (const program of instPrograms) {
                output += `    Program:\n`;
                for (const [pKey, pValue] of Object.entries(program)) {
                    if (pKey === '_id' || pKey === '__v') continue;
                    output += `      ${pKey}: ${JSON.stringify(pValue)}\n`;
                }
            }
        }
        output += '\n';
    }

    const outPath = path.join(__dirname, '../data/institutions_programs.txt');
    fs.writeFileSync(outPath, output, 'utf8');
    console.log('Exported to', outPath);
    await mongoose.disconnect();
}

exportInstitutionsWithPrograms().catch(console.error);
