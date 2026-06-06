export async function analyzeComplaint(complaint, captchaToken) {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/api/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ complaint, captcha_token: captchaToken }),
  });
  if (!res.ok) {
    const err = new Error('API error');
    err.status = res.status;
    throw err;
  }
  return res.json();
}

export async function generateRTI(complaint, answers) {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ complaint, answers }),
  });
  if (!res.ok) {
    const err = new Error('API error');
    err.status = res.status;
    throw err;
  }
  return res.json();
}
