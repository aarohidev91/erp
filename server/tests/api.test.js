const request = require('supertest');

const BASE = process.env.TEST_BASE_URL || 'http://localhost:5000';

let adminToken, receptionistToken, counsellorToken, auditorToken;
let caseId, correctionId, departmentId, courseId, counsellorUserId;

describe('College ERP API Tests', () => {
  // ── Auth ──
  describe('Auth', () => {
    test('POST /api/auth/login - reject empty body', async () => {
      const res = await request(BASE).post('/api/auth/login').send({});
      expect(res.status).toBe(400);
    });

    test('POST /api/auth/login - reject bad credentials', async () => {
      const res = await request(BASE).post('/api/auth/login').send({ username: 'bad', password: 'bad' });
      expect(res.status).toBe(401);
    });

    test('POST /api/auth/login - admin login', async () => {
      const res = await request(BASE).post('/api/auth/login').send({ username: 'admin', password: 'Admin@123' });
      expect(res.status).toBe(200);
      expect(res.body.accessToken).toBeDefined();
      expect(res.body.refreshToken).toBeDefined();
      expect(res.body.user.password).toBeUndefined();
      expect(res.body.user.refreshToken).toBeUndefined();
      adminToken = res.body.accessToken;
    });

    test('POST /api/auth/login - receptionist login', async () => {
      const res = await request(BASE).post('/api/auth/login').send({ username: 'receptionist1', password: 'Recep@123' });
      expect(res.status).toBe(200);
      receptionistToken = res.body.accessToken;
    });

    test('POST /api/auth/login - counsellor login', async () => {
      const res = await request(BASE).post('/api/auth/login').send({ username: 'counsellor1', password: 'Couns@123' });
      expect(res.status).toBe(200);
      counsellorToken = res.body.accessToken;
    });

    test('POST /api/auth/login - auditor login', async () => {
      const res = await request(BASE).post('/api/auth/login').send({ username: 'auditor', password: 'Auditor@123' });
      expect(res.status).toBe(200);
      auditorToken = res.body.accessToken;
    });

    test('GET /api/auth/me - return user without password', async () => {
      const res = await request(BASE).get('/api/auth/me').set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.user).toBeDefined();
      expect(res.body.user.password).toBeUndefined();
    });

    test('GET /api/auth/me - reject without token', async () => {
      const res = await request(BASE).get('/api/auth/me');
      expect(res.status).toBe(401);
    });

    test('POST /api/auth/refresh-token - refresh tokens', async () => {
      const login = await request(BASE).post('/api/auth/login').send({ username: 'admin', password: 'Admin@123' });
      const res = await request(BASE).post('/api/auth/refresh-token').send({ refreshToken: login.body.refreshToken });
      expect(res.status).toBe(200);
      expect(res.body.accessToken).toBeDefined();
      adminToken = res.body.accessToken;
    });
  });

  // ── Departments & Courses ──
  describe('Departments & Courses', () => {
    test('GET /api/departments', async () => {
      const res = await request(BASE).get('/api/departments').set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.departments.length).toBeGreaterThan(0);
      departmentId = res.body.departments[0]._id;
    });

    test('GET /api/courses', async () => {
      const res = await request(BASE).get('/api/courses').set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.courses.length).toBeGreaterThan(0);
      courseId = res.body.courses[0]._id;
    });
  });

  // ── Users ──
  describe('Users', () => {
    test('GET /api/users - admin can list', async () => {
      const res = await request(BASE).get('/api/users?limit=100').set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.users.length).toBeGreaterThan(0);
      res.body.users.forEach(u => {
        expect(u.password).toBeUndefined();
        expect(u.refreshToken).toBeUndefined();
      });
      counsellorUserId = res.body.users.find(u => u.username === 'counsellor1')?._id;
    });
  });

  // ── Case Creation & Locking ──
  describe('Cases', () => {
    test('POST /api/cases - receptionist creates admission enquiry', async () => {
      const res = await request(BASE).post('/api/cases')
        .set('Authorization', `Bearer ${receptionistToken}`)
        .send({
          visitorName: 'Jest Test Student', visitorType: 'student', studentName: 'Jest Student',
          parentName: 'Jest Parent', mobile: '9999000001', email: 'jest@test.com',
          purposeCategory: 'admission_enquiry', source: 'walk_in', priority: 'high',
          currentDepartment: departmentId, preferredCourse: courseId,
        });
      expect(res.status).toBe(201);
      expect(res.body.case.caseId).toBeDefined();
      expect(res.body.case.lockedAfterSubmit).toBe(true);
      caseId = res.body.case._id;
    });

    test('Case is locked after submit', async () => {
      const res = await request(BASE).get(`/api/cases/${caseId}`).set('Authorization', `Bearer ${receptionistToken}`);
      expect(res.body.case.lockedAfterSubmit).toBe(true);
    });

    test('PUT /api/cases/:id/fields - blocked for locked original fields', async () => {
      const res = await request(BASE).put(`/api/cases/${caseId}/fields`)
        .set('Authorization', `Bearer ${counsellorToken}`)
        .send({ visitorName: 'Hacked Name' });
      expect(res.status).toBe(403);
    });

    test('PUT /api/cases/:id/fields - blocked for security fields', async () => {
      const res = await request(BASE).put(`/api/cases/${caseId}/fields`)
        .set('Authorization', `Bearer ${counsellorToken}`)
        .send({ isDeleted: true, lockedAfterSubmit: false });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('No valid fields to update');
    });

    test('PUT /api/cases/:id/fields - allowed fields work', async () => {
      const res = await request(BASE).put(`/api/cases/${caseId}/fields`)
        .set('Authorization', `Bearer ${counsellorToken}`)
        .send({ leadTemperature: 'hot' });
      expect(res.status).toBe(200);
    });

    test('Auditor cannot create cases', async () => {
      const res = await request(BASE).post('/api/cases')
        .set('Authorization', `Bearer ${auditorToken}`)
        .send({ visitorName: 'Hack', mobile: '1111111111', purposeCategory: 'general_enquiry' });
      expect(res.status).toBe(403);
    });
  });

  // ── Forwarding ──
  describe('Forwarding', () => {
    test('POST /api/cases/:id/forward - forward to counsellor', async () => {
      const res = await request(BASE).post(`/api/cases/${caseId}/forward`)
        .set('Authorization', `Bearer ${receptionistToken}`)
        .send({ toDepartment: departmentId, toUser: counsellorUserId, reason: 'Admission enquiry', priority: 'high' });
      expect(res.status).toBe(200);
      expect(res.body.case).toBeDefined();
    });

    test('Forward without toDepartment auto-resolves', async () => {
      const res = await request(BASE).post(`/api/cases/${caseId}/forward`)
        .set('Authorization', `Bearer ${counsellorToken}`)
        .send({ reason: 'Academic review', priority: 'medium' });
      expect(res.status).toBe(200);
    });
  });

  // ── Notes ──
  describe('Notes', () => {
    let noteId;

    test('POST /api/cases/:id/notes - add note', async () => {
      const res = await request(BASE).post(`/api/cases/${caseId}/notes`)
        .set('Authorization', `Bearer ${counsellorToken}`)
        .send({ text: 'Original note text', noteType: 'counselling' });
      expect(res.status).toBe(201);
      expect(res.body.note._id).toBeDefined();
      noteId = res.body.note._id;
    });

    test('PUT /api/cases/:id/notes/:noteId - edit note stores version history', async () => {
      const res = await request(BASE).put(`/api/cases/${caseId}/notes/${noteId}`)
        .set('Authorization', `Bearer ${counsellorToken}`)
        .send({ text: 'Edited note text', reason: 'Typo fix' });
      expect(res.status).toBe(200);
      expect(res.body.note.versionHistory.length).toBe(1);
      expect(res.body.note.versionHistory[0].previousText).toBe('Original note text');
    });
  });

  // ── Correction Requests ──
  describe('Correction Requests', () => {
    test('POST /api/correction-requests/case/:id - create correction', async () => {
      const res = await request(BASE).post(`/api/correction-requests/case/${caseId}`)
        .set('Authorization', `Bearer ${receptionistToken}`)
        .send({ fieldToCorrect: 'email', oldValue: 'jest@test.com', requestedNewValue: 'corrected@test.com', reason: 'Wrong email' });
      expect(res.status).toBe(201);
      correctionId = res.body.correctionRequest._id;
    });

    test('Receptionist cannot approve corrections', async () => {
      const res = await request(BASE).put(`/api/correction-requests/${correctionId}/review`)
        .set('Authorization', `Bearer ${receptionistToken}`)
        .send({ status: 'approved', reviewRemarks: 'Self-approved' });
      expect(res.status).toBe(403);
    });

    test('Admin approves correction', async () => {
      const res = await request(BASE).put(`/api/correction-requests/${correctionId}/review`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'approved', reviewRemarks: 'Verified and approved' });
      expect(res.status).toBe(200);
      expect(res.body.correctionRequest.status).toBe('approved');
    });

    test('Corrected value applied to case', async () => {
      const res = await request(BASE).get(`/api/cases/${caseId}`).set('Authorization', `Bearer ${adminToken}`);
      expect(res.body.case.email).toBe('corrected@test.com');
    });

    test('GET /api/correction-requests', async () => {
      const res = await request(BASE).get('/api/correction-requests').set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.correctionRequests).toBeDefined();
    });
  });

  // ── Accounts ──
  describe('Accounts', () => {
    let feeStructureId;

    test('POST /api/accounts/:caseId/fee-structure', async () => {
      const res = await request(BASE).post(`/api/accounts/${caseId}/fee-structure`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ course: courseId, session: '2024-25', tuitionFee: 100000, labFee: 10000, examFee: 3000 });
      expect(res.status).toBe(201);
      feeStructureId = res.body.feeStructure._id;
    });

    test('POST /api/accounts/:caseId/payment', async () => {
      const res = await request(BASE).post(`/api/accounts/${caseId}/payment`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ feeStructure: feeStructureId, amount: 25000, paymentMode: 'cash', remarks: 'Registration fee' });
      expect(res.status).toBe(201);
      expect(res.body.payment.receiptNumber).toBeDefined();
      expect(res.body.receipt).toBeDefined();
    });

    test('GET /api/accounts/payments', async () => {
      const res = await request(BASE).get('/api/accounts/payments').set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.payments.length).toBeGreaterThan(0);
    });
  });

  // ── Registrar ──
  describe('Registrar', () => {
    test('POST /api/registrar/:caseId/checklist', async () => {
      const res = await request(BASE).post(`/api/registrar/${caseId}/checklist`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ documents: [{ documentType: '10th_marksheet', isRequired: true }, { documentType: '12th_marksheet', isRequired: true }] });
      expect(res.status).toBe(201);
      expect(res.body.checklist.length).toBe(2);
    });

    test('GET /api/registrar/:caseId/checklist', async () => {
      const res = await request(BASE).get(`/api/registrar/${caseId}/checklist`).set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.checklist.length).toBe(2);
    });

    test('POST /api/registrar/:caseId/finalize - admit student', async () => {
      const res = await request(BASE).post(`/api/registrar/${caseId}/finalize`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ enrollmentNumber: 'ENR-JEST-001', rollNumber: 'CSE-JEST-001', batch: '2024', session: '2024-25', section: 'A', status: 'admitted' });
      expect(res.status).toBe(200);
      expect(res.body.case.currentStatus).toBe('admitted');
      expect(res.body.receipt).toBeDefined();
    });
  });

  // ── PDF Generation ──
  describe('PDF', () => {
    test('POST /api/cases/:id/pdf - visitor entry', async () => {
      const res = await request(BASE).post(`/api/cases/${caseId}/pdf`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ type: 'visitor_entry' });
      expect(res.status).toBe(200);
      expect(res.body.receipt.receiptType).toBe('visitor_entry');
      expect(res.body.receipt.filePath).toBeDefined();
    });

    test('POST /api/cases/:id/pdf - case summary', async () => {
      const res = await request(BASE).post(`/api/cases/${caseId}/pdf`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ type: 'case_summary' });
      expect(res.status).toBe(200);
      expect(res.body.receipt.receiptType).toBe('case_summary');
    });
  });

  // ── Timeline ──
  describe('Timeline', () => {
    test('Case has timeline events', async () => {
      const res = await request(BASE).get(`/api/cases/${caseId}`).set('Authorization', `Bearer ${adminToken}`);
      expect(res.body.timeline.length).toBeGreaterThan(5);
    });
  });

  // ── Reports ──
  describe('Reports', () => {
    test('GET /api/reports/dashboard', async () => {
      const res = await request(BASE).get('/api/reports/dashboard').set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.totalCases).toBeGreaterThan(0);
    });

    test('GET /api/reports/receptionist', async () => {
      const res = await request(BASE).get('/api/reports/receptionist').set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
    });

    test('GET /api/reports/counsellor', async () => {
      const res = await request(BASE).get('/api/reports/counsellor').set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
    });

    test('GET /api/reports/fee', async () => {
      const res = await request(BASE).get('/api/reports/fee').set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
    });

    test('GET /api/reports/audit-logs', async () => {
      const res = await request(BASE).get('/api/reports/audit-logs').set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.logs.length).toBeGreaterThan(0);
    });

    test('GET /api/reports/login-logs', async () => {
      const res = await request(BASE).get('/api/reports/login-logs').set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
    });

    test('GET /api/reports/staff-performance', async () => {
      const res = await request(BASE).get('/api/reports/staff-performance').set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
    });

    test('GET /api/reports/follow-ups', async () => {
      const res = await request(BASE).get('/api/reports/follow-ups').set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
    });
  });

  // ── Notifications ──
  describe('Notifications', () => {
    test('GET /api/notifications', async () => {
      const res = await request(BASE).get('/api/notifications').set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
    });
  });

  // ── Settings ──
  describe('Settings', () => {
    test('GET /api/settings', async () => {
      const res = await request(BASE).get('/api/settings').set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
    });

    test('GET /api/settings/custom-purposes', async () => {
      const res = await request(BASE).get('/api/settings/custom-purposes').set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
    });
  });

  // ── Soft Delete ──
  describe('Soft Delete', () => {
    test('POST /api/cases/:id/soft-delete - admin only', async () => {
      const res = await request(BASE).post(`/api/cases/${caseId}/soft-delete`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ reason: 'Test cleanup' });
      expect(res.status).toBe(200);
    });

    test('Receptionist cannot soft-delete', async () => {
      const create = await request(BASE).post('/api/cases')
        .set('Authorization', `Bearer ${receptionistToken}`)
        .send({ visitorName: 'Del Test', mobile: '9999000002', purposeCategory: 'general_enquiry', currentDepartment: departmentId });
      const res = await request(BASE).post(`/api/cases/${create.body.case._id}/soft-delete`)
        .set('Authorization', `Bearer ${receptionistToken}`)
        .send({ reason: 'Should fail' });
      expect(res.status).toBe(403);
    });
  });

  // ── Health ──
  describe('Health', () => {
    test('GET /api/health', async () => {
      const res = await request(BASE).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
    });

    test('GET /api/permissions', async () => {
      const res = await request(BASE).get('/api/permissions');
      expect(res.status).toBe(200);
      expect(res.body.permissions.length).toBeGreaterThan(0);
    });
  });
});
