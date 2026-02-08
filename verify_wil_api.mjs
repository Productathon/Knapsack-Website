import http from 'http';

const WIL_PORT = 3000;
const WIL_HOST = '127.0.0.1';

function makeRequest(path, method = 'GET') {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: WIL_HOST,
      port: WIL_PORT,
      path: '/api/v1' + path,
      method: method,
      headers: { 'Content-Type': 'application/json' }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ status: res.statusCode, data: data ? JSON.parse(data) : null });
          } else {
             resolve({ status: res.statusCode, error: data });
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', (e) => reject(e));
    req.end();
  });
}

async function verify() {
  console.log('Running WIL API Verification...');
  
  // 1. Check Health
  try {
    const health = await makeRequest('/health');
    if (health.status === 200) {
        console.log('✅ Health Check Passed');
    } else {
        console.error('❌ Health Check Failed:', health);
    }
  } catch (e) {
      console.error('❌ Health Check Connection Failed:', e.message);
  }

  // 2. Check Dossiers
  try {
    const dossiers = await makeRequest('/dossiers?limit=1');
    if (dossiers.status === 200 && dossiers.data.dossiers) {
        console.log(`✅ Dossiers Endpoint Passed (Found ${dossiers.data.count})`);
        if (dossiers.data.count > 0) {
            const d = dossiers.data.dossiers[0];
            // Verify structure matches what we expect in Frontend
            if (d.id && d.sections && d.recommendations) {
                 console.log('   Structure verified: id, sections, recommendations present');
            } else {
                 console.warn('   ⚠️ Partial structure match:', Object.keys(d));
            }
        }
    } else {
        console.error('❌ Dossiers Endpoint Failed:', dossiers);
    }
  } catch (e) {
      console.error('❌ Dossiers Connection Failed:', e.message);
  }
  
  // 3. Check Logs Stream (just connection)
  // Harder to test stream with simple http client for one-off, but we can try to connect
  console.log('ℹ️  Logs Stream verification requires running browser or curl.');
}

verify();
