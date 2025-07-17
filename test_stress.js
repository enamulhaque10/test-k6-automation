import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
    stages: [
        { duration: '1m', target: 10 },
        { duration: '1m', target: 20 },
        { duration: '1m', target: 30 },
        { duration: '1m', target: 40 },
        { duration: '1m', target: 50 },
        { duration: '1m', target: 0 },
    ],
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
