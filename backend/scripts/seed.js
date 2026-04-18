/**
 * Database Seed Script
 * Seeds the MongoDB with all the university data from the frontend's universityData.ts
 *
 * Usage: node scripts/seed.js
 */

const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const User = require("../models/User");
const School = require("../models/School");
const Department = require("../models/Department");
const Program = require("../models/Program");
const Subject = require("../models/Subject");
const FacultyAssignment = require("../models/FacultyAssignment");
const Syllabus = require("../models/Syllabus");

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // ── Clear existing data ──────────────────
    console.log("Clearing existing data...");
    await Promise.all([
      User.deleteMany({}),
      School.deleteMany({}),
      Department.deleteMany({}),
      Program.deleteMany({}),
      Subject.deleteMany({}),
      FacultyAssignment.deleteMany({}),
      Syllabus.deleteMany({}),
    ]);

    // ── Create Schools ───────────────────────
    console.log("Creating schools...");
    const schoolsData = [
      { name: "Dr. B.R. Ambedkar Memorial College of Pharmacy and Spirituality", code: "DBMCPS" },
      { name: "Dr. B.R. Ambedkar School of Architecture", code: "DBSA" },
      { name: "School of Agriculture", code: "SOA" },
      { name: "School of Applied Sciences", code: "SOAS" },
      { name: "School of Design and Performing Arts", code: "SODAP" },
      { name: "School of Engineering and Computing", code: "SOEC" },
      { name: "School of Hotel Management and Tourism", code: "SOHMT" },
      { name: "School of Journalism, Languages and Arts", code: "SOJLA" },
      { name: "School of Law", code: "SOL" },
      { name: "School of Management and Commerce", code: "SOMC" },
      { name: "School of Nursing", code: "SON" },
      { name: "School of Paramedical and Research", code: "SOPR" },
    ];

    const schools = {};
    for (const s of schoolsData) {
      const school = await School.create(s);
      schools[s.code] = school;
    }
    console.log(`  Created ${Object.keys(schools).length} schools`);

    // ── Create Users ─────────────────────────
    console.log("Creating users (Seeding of dummy users disabled)...");

    /* 
    const superadmin = await User.create({
      name: "Admin User",
      email: "admin@university.edu",
      password: "admin123",
      role: "SuperAdmin",
    });
    */

    console.log("  No users created by seeder. Please use the Signup page.");

    // ── Create Departments ───────────────────
    console.log("Creating departments...");
    const deptsData = [
      { name: "Civil Engineering", schoolCode: "SOEC" },
      { name: "Computer Application", schoolCode: "SOEC" },
      { name: "Computer Science and Engineering", schoolCode: "SOEC" },
      { name: "Electrical Engineering", schoolCode: "SOEC" },
      { name: "Mechanical Engineering", schoolCode: "SOEC" },
      { name: "Management Studies", schoolCode: "SOMC" },
      { name: "Commerce", schoolCode: "SOMC" },
      { name: "Pharmacy", schoolCode: "DBMCPS" },
      { name: "Architecture", schoolCode: "DBSA" },
      { name: "Agriculture Science", schoolCode: "SOA" },
    ];

    const depts = {};
    for (const d of deptsData) {
      const dept = await Department.create({
        name: d.name,
        schoolId: schools[d.schoolCode]._id,
      });
      depts[d.name] = dept;
    }
    console.log(`  Created ${Object.keys(depts).length} departments`);

    // ── Initial setup completed ─────────────
    console.log("  University structure and admin account established.");

    // ── Create Programs ──────────────────────
    console.log("Creating programs...");
    const progsData = [
      { name: "B.Tech CSE Core", level: "UG", duration: 48, startYear: 2020, dept: "Computer Science and Engineering",
        intakeStats: [{ year: 2021, count: 120 }, { year: 2022, count: 135 }, { year: 2023, count: 150 }, { year: 2024, count: 155 }, { year: 2025, count: 160 }] },
      { name: "B.Tech CSE AI/ML", level: "UG", duration: 48, startYear: 2021, dept: "Computer Science and Engineering",
        intakeStats: [{ year: 2021, count: 60 }, { year: 2022, count: 75 }, { year: 2023, count: 90 }, { year: 2024, count: 100 }, { year: 2025, count: 110 }] },
      { name: "B.Tech CSE Data Science", level: "UG", duration: 48, startYear: 2022, dept: "Computer Science and Engineering",
        intakeStats: [{ year: 2022, count: 40 }, { year: 2023, count: 55 }, { year: 2024, count: 70 }, { year: 2025, count: 80 }] },
      { name: "M.Tech CSE Core", level: "PG", duration: 24, startYear: 2018, dept: "Computer Science and Engineering",
        intakeStats: [{ year: 2021, count: 30 }, { year: 2022, count: 35 }, { year: 2023, count: 40 }, { year: 2024, count: 42 }, { year: 2025, count: 45 }] },
      { name: "M.Tech AI/ML", level: "PG", duration: 24, startYear: 2020, dept: "Computer Science and Engineering",
        intakeStats: [{ year: 2021, count: 20 }, { year: 2022, count: 25 }, { year: 2023, count: 30 }, { year: 2024, count: 35 }, { year: 2025, count: 38 }] },
      { name: "M.Tech Data Science", level: "PG", duration: 24, startYear: 2021, dept: "Computer Science and Engineering",
        intakeStats: [{ year: 2022, count: 15 }, { year: 2023, count: 22 }, { year: 2024, count: 28 }, { year: 2025, count: 32 }] },
      { name: "Ph.D in Computer Science", level: "Ph.D", duration: 36, startYear: 2015, dept: "Computer Science and Engineering",
        intakeStats: [{ year: 2021, count: 8 }, { year: 2022, count: 10 }, { year: 2023, count: 12 }, { year: 2024, count: 15 }, { year: 2025, count: 18 }] },
      { name: "B.Tech Civil Engineering", level: "UG", duration: 48, startYear: 2019, dept: "Civil Engineering",
        intakeStats: [{ year: 2021, count: 90 }, { year: 2022, count: 95 }, { year: 2023, count: 100 }, { year: 2024, count: 105 }, { year: 2025, count: 110 }] },
      { name: "Master of Computer Applications (MCA)", level: "PG", duration: 24, startYear: 2017, dept: "Computer Application",
        intakeStats: [{ year: 2021, count: 60 }, { year: 2022, count: 65 }, { year: 2023, count: 70 }, { year: 2024, count: 75 }, { year: 2025, count: 80 }] },
      { name: "Master of Business Administration (MBA)", level: "PG", duration: 24, startYear: 2016, dept: "Management Studies",
        intakeStats: [{ year: 2021, count: 100 }, { year: 2022, count: 110 }, { year: 2023, count: 120 }, { year: 2024, count: 125 }, { year: 2025, count: 130 }] },
      { name: "Bachelor of Commerce (B.Com)", level: "UG", duration: 36, startYear: 2018, dept: "Commerce",
        intakeStats: [{ year: 2021, count: 80 }, { year: 2022, count: 85 }, { year: 2023, count: 90 }, { year: 2024, count: 95 }, { year: 2025, count: 100 }] },
    ];

    const progs = {};
    for (const p of progsData) {
      const prog = await Program.create({
        name: p.name,
        level: p.level,
        duration: p.duration,
        startYear: p.startYear,
        departmentId: depts[p.dept]._id,
        intakeStats: p.intakeStats,
      });
      progs[p.name] = prog;
    }
    console.log(`  Created ${Object.keys(progs).length} programs`);

    // ── Create Subjects ──────────────────────
    console.log("Creating subjects...");
    const subjsData = [
      // B.Tech CSE Core
      { name: "Programming Fundamentals", prog: "B.Tech CSE Core", yl: "Year 1", yo: 1, dept: "Computer Science and Engineering" },
      { name: "Engineering Mathematics", prog: "B.Tech CSE Core", yl: "Year 1", yo: 1, dept: "Computer Science and Engineering" },
      { name: "Basic Electronics", prog: "B.Tech CSE Core", yl: "Year 1", yo: 1, dept: "Computer Science and Engineering" },
      { name: "Data Structures", prog: "B.Tech CSE Core", yl: "Year 2", yo: 2, dept: "Computer Science and Engineering" },
      { name: "Operating Systems", prog: "B.Tech CSE Core", yl: "Year 2", yo: 2, dept: "Computer Science and Engineering" },
      { name: "Discrete Mathematics", prog: "B.Tech CSE Core", yl: "Year 2", yo: 2, dept: "Computer Science and Engineering" },
      { name: "DBMS", prog: "B.Tech CSE Core", yl: "Year 3", yo: 3, dept: "Computer Science and Engineering" },
      { name: "Computer Networks", prog: "B.Tech CSE Core", yl: "Year 3", yo: 3, dept: "Computer Science and Engineering" },
      { name: "Software Engineering", prog: "B.Tech CSE Core", yl: "Year 3", yo: 3, dept: "Computer Science and Engineering" },
      { name: "Machine Learning", prog: "B.Tech CSE Core", yl: "Year 4", yo: 4, dept: "Computer Science and Engineering" },
      { name: "Distributed Systems", prog: "B.Tech CSE Core", yl: "Year 4", yo: 4, dept: "Computer Science and Engineering" },
      { name: "Project Work", prog: "B.Tech CSE Core", yl: "Year 4", yo: 4, dept: "Computer Science and Engineering" },

      // B.Tech CSE AI/ML
      { name: "Programming Fundamentals", prog: "B.Tech CSE AI/ML", yl: "Year 1", yo: 1, dept: "Computer Science and Engineering" },
      { name: "Engineering Mathematics", prog: "B.Tech CSE AI/ML", yl: "Year 1", yo: 1, dept: "Computer Science and Engineering" },
      { name: "Basic Electronics", prog: "B.Tech CSE AI/ML", yl: "Year 1", yo: 1, dept: "Computer Science and Engineering" },
      { name: "Data Structures", prog: "B.Tech CSE AI/ML", yl: "Year 2", yo: 2, dept: "Computer Science and Engineering" },
      { name: "Operating Systems", prog: "B.Tech CSE AI/ML", yl: "Year 2", yo: 2, dept: "Computer Science and Engineering" },
      { name: "Probability & Statistics", prog: "B.Tech CSE AI/ML", yl: "Year 2", yo: 2, dept: "Computer Science and Engineering" },
      { name: "DBMS", prog: "B.Tech CSE AI/ML", yl: "Year 3", yo: 3, dept: "Computer Science and Engineering" },
      { name: "Machine Learning", prog: "B.Tech CSE AI/ML", yl: "Year 3", yo: 3, dept: "Computer Science and Engineering" },
      { name: "Artificial Intelligence", prog: "B.Tech CSE AI/ML", yl: "Year 3", yo: 3, dept: "Computer Science and Engineering" },
      { name: "Deep Learning", prog: "B.Tech CSE AI/ML", yl: "Year 4", yo: 4, dept: "Computer Science and Engineering" },
      { name: "NLP", prog: "B.Tech CSE AI/ML", yl: "Year 4", yo: 4, dept: "Computer Science and Engineering" },
      { name: "AI Project", prog: "B.Tech CSE AI/ML", yl: "Year 4", yo: 4, dept: "Computer Science and Engineering" },

      // Civil Engineering
      { name: "Engineering Mechanics", prog: "B.Tech Civil Engineering", yl: "Year 1", yo: 1, dept: "Civil Engineering" },
      { name: "Surveying", prog: "B.Tech Civil Engineering", yl: "Year 1", yo: 1, dept: "Civil Engineering" },
      { name: "Structural Analysis", prog: "B.Tech Civil Engineering", yl: "Year 2", yo: 2, dept: "Civil Engineering" },
      { name: "Geotechnical Engineering", prog: "B.Tech Civil Engineering", yl: "Year 2", yo: 2, dept: "Civil Engineering" },

      // MCA
      { name: "Web Technologies", prog: "Master of Computer Applications (MCA)", yl: "Year 1", yo: 1, dept: "Computer Application" },
      { name: "Database Systems", prog: "Master of Computer Applications (MCA)", yl: "Year 1", yo: 1, dept: "Computer Application" },
      { name: "Cloud Computing", prog: "Master of Computer Applications (MCA)", yl: "Year 2", yo: 2, dept: "Computer Application" },
      { name: "Project Work", prog: "Master of Computer Applications (MCA)", yl: "Year 2", yo: 2, dept: "Computer Application" },

      // MBA
      { name: "Financial Management", prog: "Master of Business Administration (MBA)", yl: "Year 1", yo: 1, dept: "Management Studies" },
      { name: "Marketing Strategy", prog: "Master of Business Administration (MBA)", yl: "Year 1", yo: 1, dept: "Management Studies" },
      { name: "Applied Economics and Computing", prog: "Master of Business Administration (MBA)", yl: "Year 2", yo: 2, dept: "Management Studies" },
      { name: "Strategic Management", prog: "Master of Business Administration (MBA)", yl: "Year 2", yo: 2, dept: "Management Studies" },

      // B.Com
      { name: "Accounting Principles", prog: "Bachelor of Commerce (B.Com)", yl: "Year 1", yo: 1, dept: "Commerce" },
      { name: "Business Law", prog: "Bachelor of Commerce (B.Com)", yl: "Year 1", yo: 1, dept: "Commerce" },
      { name: "Corporate Finance", prog: "Bachelor of Commerce (B.Com)", yl: "Year 2", yo: 2, dept: "Commerce" },
    ];

    const subjs = {};
    let subjCount = 0;
    for (const s of subjsData) {
      const subj = await Subject.create({
        name: s.name,
        programId: progs[s.prog]._id,
        yearLabel: s.yl,
        yearOrder: s.yo,
        departmentId: depts[s.dept]._id,
      });
      // Store with a key for assignment mapping
      subjs[`${s.prog}|${s.name}|${s.yl}`] = subj;
      subjCount++;
    }
    console.log(`  Created ${subjCount} subjects`);

    // ── Faculty Assignments skipped ──────────
    console.log("  Faculty assignments skipped (awaiting real faculty signup)");

    // ── Sample Syllabi skipped ──────────────
    console.log("  Sample syllabi skipped (awaiting real faculty submission)");

    // ── Summary ──────────────────────────────
    console.log("\n✅ Seed completed successfully!");
    console.log("\n📋 Note: All dummy users have been removed. Please sign up via the UI to create your accounts.");

    process.exit(0);
  } catch (err) {
    console.error("Seed error:", err);
    process.exit(1);
  }
}

seed();
