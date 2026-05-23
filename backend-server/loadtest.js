import http from 'k6/http';
import { check, sleep } from 'k6';

// k6_spiketest

// export const options = {
//   stages: [
//     { duration: '5s', target:30 }, 
//     { duration: '20s', target: 30 },
//     { duration: '10s', target: 0 }, 
//   ],
// };

// k6_loadtest

export const options = {
  stages: [
    { duration: '10s', target:20 }, 
    { duration: '20s', target: 20 },
    { duration: '10s', target: 0 }, 
  ],
};

export default function Test() {
  let res = http.get('https://healthguard-api-42q2.onrender.com/api-docs/');

  check(res, {
    'status was 200': (r) => r.status === 200,
    'thời gian phản hồi < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1);
}