const API_URL = import.meta.env.VITE_API_URL;

export async function analyzeComplaint(complaint, captcha_token){
    let response;
    try {
        response = await fetch(`${API_URL}/api/analyze`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ complaint, captcha_token : captcha_token }),});
    }
    catch{
        const err = new Error("Network failure");
        err.status = 0;
        throw err;
    }
    if (!response.ok){
        const err = new Error(`HTTP ${response.status}`);
        err.status = response.status;
        throw err;
    }
    return response.json();
}

export async function generateRTI(complaint, answers){
    let response;
    try{
        response = await fetch(`${API_URL}/api/generate`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ complaint, answers}),
        });
    }
    catch{
        const err = new Error("Network failure");
        err.status = 0;
        throw err;
    }
    if (!response.ok){
        const err = new Error(`HTTP ${response.status}`);
        err.status = response.status;
        throw err;
    }
    return response.json();
}