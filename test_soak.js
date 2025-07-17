import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  vus: 10,              
  duration: '1h', 
  insecureSkipTLSVerify: true,       
};

const BASE_URL = 'https://dev-pm.centralus.cloudapp.azure.com';
const PRACTICE_ID = 'PLA001';
const USERNAME = 'playwright@nextech.com';
const PASSWORD = 'Cp9mb.eu3L!:HxU';

export default function () {
  const res = http.post(
            `${BASE_URL}/Account/Login?AccountNumber=${PRACTICE_ID}&UserEmail=${USERNAME}&Password=${PASSWORD}&TimeZone=America/New_Work`,
            null,
            { headers: { 'Content-Type': 'application/json' } }
          );

  check(res, {
          'Login success': (r) => r.status === 200,
          'Token exists': (r) => r.cookies['NextechToken'] !== undefined,
        });
  sleep(1);
}
