
import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { SharedArray } from 'k6/data';

export let options = {
  vus: 10,
  duration: '1m',
  insecureSkipTLSVerify: true,
};

const BASE_URL = 'https://dev-pm.centralus.cloudapp.azure.com';
const PRACTICE_ID = 'PLA001';
const USERNAME = 'playwright@nextech.com';
const PASSWORD = 'Cp9mb.eu3L!:HxU';
const PATIENT_IDS = [8227, 2500, 3012, 1105];

export default function () {
  let token = '';

  group('1. Login', function () {
    let res = http.post(
      `${BASE_URL}/Account/Login?AccountNumber=${PRACTICE_ID}&UserEmail=${USERNAME}&Password=${PASSWORD}&TimeZone=America/New_Work`,
      null,
      { headers: { 'Content-Type': 'application/json' } }
    );

    check(res, {
      'Login success': (r) => r.status === 200,
      'Token exists': (r) => r.cookies['NextechToken'] !== undefined,
    });

    token = res.cookies['NextechToken']?.[0]?.value || '';
  });

  const authHeaders = {
    'Content-Type': 'application/json',
    'Cookie': `NextechToken=${token}`,
  };

  group('2. BasicPatientSearch', function () {
    let res = http.post(`${BASE_URL}/api/patient-search/BasicPatientSearch`, JSON.stringify({ search: 'a' }), { headers: authHeaders });
    check(res, { 'Search 200': (r) => r.status === 200 });
  });

  group('3. List Product', function () {
    let res = http.get(`${BASE_URL}/administration/product/getList`, { headers: authHeaders });
    check(res, { 'Product 200': (r) => r.status === 200 });
  });

  group('4. List Providers', function () {
    let res = http.get(`${BASE_URL}/api/provider`, { headers: authHeaders });
    check(res, { 'Providers 200': (r) => r.status === 200 });
  });

  group('5. List Practice', function () {
    let res = http.get(`${BASE_URL}/api/appointment-resource/online-scheduling`, { headers: authHeaders });
    check(res, { 'Practice 200': (r) => r.status === 200 });
  });

  group('6. List Service', function () {
    let res = http.get(`${BASE_URL}/administration/practiceservice/getList?deleted=false&isDescending=false&page=1&searchString=&sortColumn=name`, { headers: authHeaders });
    check(res, { 'Service 200': (r) => r.status === 200 });
  });

  group('7. Get Patient', function () {
    PATIENT_IDS.forEach((id) => {
      let res = http.get(`${BASE_URL}/api/patient-context?patientId=${id}`, { headers: authHeaders });
      check(res, { [`Patient ${id} 200`]: (r) => r.status === 200 });
      sleep(1);
    });
  });

  group('8. User Info (basic)', function () {
    let res = http.get(`https://qa-pm.centralus.cloudapp.azure.com/api/user?expandRoles=false&expandUserPractices=false`, { headers: authHeaders });
    check(res, { 'User Info 200': (r) => r.status === 200 });
  });

  group('9. User Info (full)', function () {
    let res = http.get(`https://qa-pm.centralus.cloudapp.azure.com/api/user?expandRoles=true&expandUserPractices=true`, { headers: authHeaders });
    check(res, { 'User Info Full 200': (r) => r.status === 200 });
  });

  group('10. Schedule Page (UI)', function () {
    let res = http.get(`https://dev-pm.centralus.cloudapp.azure.com/Schedule/Schedule`, { headers: authHeaders });
    check(res, { 'Schedule UI 200': (r) => r.status === 200 });
  });

  group('11. Book Appointment', function () {
    const payload = [
      {
        startTime: '2025-05-16T13:15:00',
        patientId: PATIENT_IDS[0],
        resourceId: 105,
        facilityId: 422,
        appointmentTypeId: 2,
        appointmentReason: 'Test Reason',
        appointmentNotes: 'Test API',
      },
    ];
    let res = http.post(`https://pm.dev.nextech.com/api/appointment/worklist/book-appointments`, JSON.stringify(payload), { headers: authHeaders });
    check(res, { 'Book 200': (r) => r.status === 200 || r.status === 201 });
  });

  group('12. Availability', function () {
    const payload = {
      skip: 0,
      take: 10,
      fromDate: '2025-07-01',
      resourceIds: [105],
      resourceIdsGroupList: [[105], []],
      appointmentTypeIds: [2],
      scheduleSlotType: 1,
      bookingPreference: 1,
    };
    let res = http.post(`/api/appointment/worklist/Availability`, JSON.stringify(payload), { headers: authHeaders });
    check(res, { 'Availability 200': (r) => r.status === 200 });
  });

  sleep(1);
}
