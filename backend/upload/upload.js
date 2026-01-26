import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { eq } from 'drizzle-orm';
import xlsx from 'xlsx';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config({ path: '../.env' });

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

// Import schema - adjust path based on your structure
import { user, student_profile } from '../src/db/schema/index.js';

async function upload() {
  try {
    console.log('📚 Starting student upload...\n');
    
    // Read Excel file
    const wb = xlsx.readFile('./studata.xlsx');
    const data = xlsx.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
    const valid = data.filter(r => r.Email && r.Name);
    
    console.log(`✓ Found ${valid.length} valid students in Excel\n`);
    console.log('=' .repeat(60));
    
    let stats = {
      created: 0,
      updated: 0,
      errors: 0
    };
    
    for (let i = 0; i < valid.length; i++) {
      const r = valid[i];
      const num = `[${i + 1}/${valid.length}]`;
      
      try {
        const email = r.Email.trim().toLowerCase();
        const fullName = r.Name.trim();
        
        // Check if user exists
        const existUser = await db
          .select()
          .from(user)
          .where(eq(user.email, email))
          .limit(1);
        
        let uid;
        
        if (existUser.length === 0) {
          // Create new user with ALL required fields
          const hashedPassword = await bcrypt.hash('Student@123', 10);
          
          const newUser = await db.insert(user).values({
            id: crypto.randomUUID(),
            email: email,
            password: hashedPassword,  // NOT password_hash!
            role: 'student',
            created_at: new Date(),
            updated_at: new Date(),
          }).returning();
          
          uid = newUser[0].id;
          console.log(`${num} ✓ Created user: ${email}`);
        } else {
          uid = existUser[0].id;
          console.log(`${num} ⚠ User exists: ${email}`);
        }
        
        // Prepare profile data
        const profile = {
          id: crypto.randomUUID(),
          user_id: uid,
          full_name: fullName,
          roll_number: r['Register Number']?.toString() || null,
          student_id: r['Student ID']?.toString() || null,
          branch: r.Branch || null,
          current_semester: r['Current Semester'] ? parseInt(r['Current Semester']) : null,
          cgpa: r.CGPA ? parseFloat(r.CGPA) : null,
          tenth_score: r['10th Percentage'] ? parseFloat(r['10th Percentage']) : null,
          twelfth_score: r['12th Percentage'] ? parseFloat(r['12th Percentage']) : null,
          contact_number: r['Contact Number'] ? r['Contact Number'].toString().replace(/\D/g, '') : null,
          date_of_birth: r['Date of Birth'] ? new Date(r['Date of Birth']) : null,
          gender: r.Gender || null,
          linkedin: r['LinkedIn Profile'] || null,
          skills: r.Skills || null,
          created_at: new Date(),
          updated_at: new Date(),
        };
        
        // Check if profile exists
        const existProfile = await db
          .select()
          .from(student_profile)
          .where(eq(student_profile.user_id, uid))
          .limit(1);
        
        if (existProfile.length === 0) {
          await db.insert(student_profile).values(profile);
          stats.created++;
          console.log(`${num} ✓ Created profile: ${fullName}`);
        } else {
          delete profile.id;
          delete profile.user_id;
          delete profile.created_at;
          
          await db
            .update(student_profile)
            .set(profile)
            .where(eq(student_profile.user_id, uid));
          
          stats.updated++;
          console.log(`${num} ↻ Updated profile: ${fullName}`);
        }
        
      } catch (e) {
        stats.errors++;
        console.error(`${num} ✗ Error with ${r.Name}: ${e.message}`);
      }
    }
    
    console.log('\n' + '=' .repeat(60));
    console.log('📊 UPLOAD SUMMARY');
    console.log('=' .repeat(60));
    console.log(`✓ New Students: ${stats.created}`);
    console.log(`↻ Updated Students: ${stats.updated}`);
    console.log(`✗ Errors: ${stats.errors}`);
    console.log(`📝 Total Processed: ${valid.length}`);
    console.log('=' .repeat(60));
    console.log('\n🔑 Default Password: Student@123');
    console.log('✅ Upload complete!\n');
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

upload();