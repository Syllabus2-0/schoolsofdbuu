const http = require("http");

async function runTests() {
  const loginRes = await fetch("http://localhost:5000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@university.edu", password: "admin123" })
  });
  const loginData = await loginRes.json();
  console.log("Login Status:", loginRes.status);
  console.log("Login Data:", loginData.token ? "Token received" : loginData);

  if (!loginData.token) return;

  const schoolsRes = await fetch("http://localhost:5000/api/schools", {
    method: "GET",
    headers: { "Authorization": `Bearer ${loginData.token}` }
  });
  const schoolsData = await schoolsRes.json();
  console.log("Schools Status:", schoolsRes.status);
  console.log("Schools Count:", schoolsData.length);
  if(schoolsData.length > 0) {
    console.log("First School:", schoolsData[0].name);
  }
}

runTests().catch(console.error);
