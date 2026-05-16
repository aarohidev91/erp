require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Role = require('./models/Role');
const Department = require('./models/Department');
const Course = require('./models/Course');
const { DEFAULT_ROLE_PERMISSIONS } = require('./config/permissions');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');

    const existingAdmin = await User.findOne({ username: 'admin' });
    if (existingAdmin) {
      console.log('Seed data already exists. Skipping.');
      process.exit(0);
    }

    const roles = [];
    const roleDefinitions = [
      { name: 'Super Admin', slug: 'super_admin', isSystem: true },
      { name: 'Admin', slug: 'admin', isSystem: true },
      { name: 'Receptionist', slug: 'receptionist', isSystem: true },
      { name: 'Senior Receptionist', slug: 'senior_receptionist', isSystem: true },
      { name: 'Counsellor', slug: 'counsellor', isSystem: true },
      { name: 'Counselling Head', slug: 'counselling_head', isSystem: true },
      { name: 'Department Staff', slug: 'department_staff', isSystem: true },
      { name: 'HOD', slug: 'hod', isSystem: true },
      { name: 'Accounts Staff', slug: 'accounts_staff', isSystem: true },
      { name: 'Accounts Head', slug: 'accounts_head', isSystem: true },
      { name: 'Registrar Staff', slug: 'registrar_staff', isSystem: true },
      { name: 'Registrar', slug: 'registrar', isSystem: true },
      { name: 'Admission Head', slug: 'admission_head', isSystem: true },
      { name: 'Principal / Director', slug: 'principal', isSystem: true },
      { name: 'Auditor', slug: 'auditor', isSystem: true },
      { name: 'Event Coordinator', slug: 'event_coordinator', isSystem: true },
      { name: 'Placement Staff', slug: 'placement_staff', isSystem: true },
    ];

    for (const roleDef of roleDefinitions) {
      const role = await Role.create({
        ...roleDef,
        permissions: DEFAULT_ROLE_PERMISSIONS[roleDef.slug] || [],
      });
      roles.push(role);
    }
    console.log(`Created ${roles.length} roles`);

    const roleMap = {};
    roles.forEach(r => { roleMap[r.slug] = r._id; });

    const departments = [];
    const deptDefinitions = [
      { name: 'Administration', code: 'ADMIN' },
      { name: 'Reception', code: 'RECEP' },
      { name: 'Counselling', code: 'COUNS' },
      { name: 'Computer Science / B.Tech', code: 'CSE' },
      { name: 'BCA', code: 'BCA' },
      { name: 'Applied Science / B.Sc', code: 'BSC' },
      { name: 'Arts', code: 'ARTS' },
      { name: 'Commerce', code: 'COMM' },
      { name: 'Management', code: 'MGMT' },
      { name: 'Pharmacy', code: 'PHAR' },
      { name: 'Accounts', code: 'ACCT' },
      { name: 'Registrar Office', code: 'REGIS' },
      { name: 'Placement Cell', code: 'PLACE' },
      { name: 'Examination', code: 'EXAM' },
    ];

    for (const deptDef of deptDefinitions) {
      const dept = await Department.create(deptDef);
      departments.push(dept);
    }
    console.log(`Created ${departments.length} departments`);

    const deptMap = {};
    departments.forEach(d => { deptMap[d.code] = d._id; });

    const courseDefinitions = [
      { name: 'B.Tech Computer Science', code: 'BTECH-CSE', department: deptMap['CSE'], duration: '4 years', totalSeats: 120, availableSeats: 120, fees: 150000 },
      { name: 'BCA', code: 'BCA-01', department: deptMap['BCA'], duration: '3 years', totalSeats: 60, availableSeats: 60, fees: 80000 },
      { name: 'B.Sc Physics', code: 'BSC-PHY', department: deptMap['BSC'], duration: '3 years', totalSeats: 40, availableSeats: 40, fees: 50000 },
      { name: 'B.Sc Chemistry', code: 'BSC-CHE', department: deptMap['BSC'], duration: '3 years', totalSeats: 40, availableSeats: 40, fees: 50000 },
      { name: 'BA English', code: 'BA-ENG', department: deptMap['ARTS'], duration: '3 years', totalSeats: 60, availableSeats: 60, fees: 35000 },
      { name: 'B.Com', code: 'BCOM-01', department: deptMap['COMM'], duration: '3 years', totalSeats: 60, availableSeats: 60, fees: 45000 },
      { name: 'BBA', code: 'BBA-01', department: deptMap['MGMT'], duration: '3 years', totalSeats: 60, availableSeats: 60, fees: 70000 },
      { name: 'MBA', code: 'MBA-01', department: deptMap['MGMT'], duration: '2 years', totalSeats: 30, availableSeats: 30, fees: 200000 },
      { name: 'B.Pharm', code: 'BPHAR-01', department: deptMap['PHAR'], duration: '4 years', totalSeats: 60, availableSeats: 60, fees: 120000 },
    ];

    for (const courseDef of courseDefinitions) {
      await Course.create(courseDef);
    }
    console.log(`Created ${courseDefinitions.length} courses`);

    const admin = await User.create({
      username: 'admin',
      email: process.env.DEFAULT_ADMIN_EMAIL || 'admin@college.edu',
      password: process.env.DEFAULT_ADMIN_PASSWORD || 'Admin@123',
      firstName: 'System',
      lastName: 'Admin',
      role: roleMap['super_admin'],
      department: deptMap['ADMIN'],
      mustChangePassword: false,
    });

    const userDefinitions = [
      { username: 'receptionist1', email: 'reception1@college.edu', firstName: 'Priya', lastName: 'Sharma', role: 'receptionist', department: 'RECEP', password: 'Recep@123' },
      { username: 'receptionist2', email: 'reception2@college.edu', firstName: 'Anil', lastName: 'Kumar', role: 'receptionist', department: 'RECEP', password: 'Recep@123' },
      { username: 'sr_receptionist', email: 'sr.reception@college.edu', firstName: 'Meena', lastName: 'Gupta', role: 'senior_receptionist', department: 'RECEP', password: 'SrRecep@123' },
      { username: 'counsellor1', email: 'counsellor1@college.edu', firstName: 'Rahul', lastName: 'Verma', role: 'counsellor', department: 'COUNS', password: 'Couns@123' },
      { username: 'counsellor2', email: 'counsellor2@college.edu', firstName: 'Sunita', lastName: 'Patel', role: 'counsellor', department: 'COUNS', password: 'Couns@123' },
      { username: 'counselling_head', email: 'counselling.head@college.edu', firstName: 'Deepak', lastName: 'Joshi', role: 'counselling_head', department: 'COUNS', password: 'CounsH@123' },
      { username: 'dept_staff_cse', email: 'cse.staff@college.edu', firstName: 'Vikram', lastName: 'Singh', role: 'department_staff', department: 'CSE', password: 'Dept@123' },
      { username: 'hod_cse', email: 'hod.cse@college.edu', firstName: 'Dr. Rajesh', lastName: 'Pandey', role: 'hod', department: 'CSE', password: 'HOD@123' },
      { username: 'accounts1', email: 'accounts1@college.edu', firstName: 'Kavita', lastName: 'Mishra', role: 'accounts_staff', department: 'ACCT', password: 'Acct@123' },
      { username: 'accounts_head', email: 'accounts.head@college.edu', firstName: 'Suresh', lastName: 'Agarwal', role: 'accounts_head', department: 'ACCT', password: 'AcctH@123' },
      { username: 'registrar_staff1', email: 'registrar.staff@college.edu', firstName: 'Nisha', lastName: 'Tiwari', role: 'registrar_staff', department: 'REGIS', password: 'Reg@123' },
      { username: 'registrar', email: 'registrar@college.edu', firstName: 'Dr. Anurag', lastName: 'Saxena', role: 'registrar', department: 'REGIS', password: 'Registrar@123' },
      { username: 'admission_head', email: 'admission.head@college.edu', firstName: 'Pooja', lastName: 'Chauhan', role: 'admission_head', department: 'ADMIN', password: 'AdmH@123' },
      { username: 'principal', email: 'principal@college.edu', firstName: 'Dr. Amit', lastName: 'Srivastava', role: 'principal', department: 'ADMIN', password: 'Principal@123' },
      { username: 'auditor', email: 'auditor@college.edu', firstName: 'Rajan', lastName: 'Kapoor', role: 'auditor', department: 'ADMIN', password: 'Auditor@123' },
      { username: 'event_coord', email: 'events@college.edu', firstName: 'Anjali', lastName: 'Dubey', role: 'event_coordinator', department: 'ADMIN', password: 'Event@123' },
      { username: 'placement1', email: 'placement@college.edu', firstName: 'Rohit', lastName: 'Mehta', role: 'placement_staff', department: 'PLACE', password: 'Place@123' },
    ];

    for (const userDef of userDefinitions) {
      await User.create({
        username: userDef.username,
        email: userDef.email,
        firstName: userDef.firstName,
        lastName: userDef.lastName,
        role: roleMap[userDef.role],
        department: deptMap[userDef.department],
        password: userDef.password,
        mustChangePassword: false,
        createdBy: admin._id,
      });
    }
    console.log(`Created ${userDefinitions.length + 1} users`);

    console.log('\n=== Seed Complete ===');
    console.log('Admin Login: admin / Admin@123');
    console.log('Receptionist Login: receptionist1 / Recep@123');
    console.log('Counsellor Login: counsellor1 / Couns@123');
    console.log('Department Staff Login: dept_staff_cse / Dept@123');
    console.log('HOD Login: hod_cse / HOD@123');
    console.log('Accounts Login: accounts1 / Acct@123');
    console.log('Registrar Login: registrar / Registrar@123');
    console.log('Admission Head Login: admission_head / AdmH@123');
    console.log('Principal Login: principal / Principal@123');
    console.log('Auditor Login: auditor / Auditor@123');
    console.log('Event Coordinator Login: event_coord / Event@123');
    console.log('Placement Staff Login: placement1 / Place@123');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedData();
