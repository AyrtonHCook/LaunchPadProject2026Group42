const driverLoginForm = document.getElementById("driverLoginForm");
const loginMessage = document.getElementById("loginMessage");

driverLoginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  loginMessage.textContent = "";

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  if (!email || !password) {
    loginMessage.textContent = "Email and password are required";
    return;
  }

  try {
    const response = await fetch("/drivers/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: email,
        password: password
      })
    });

    let data;

    try {
      data = await response.json();
    } catch (error) {
      console.error("Login response was not valid JSON:", error);
      loginMessage.textContent = "Server returned an invalid response";
      return;
    }

    if (!response.ok) {
      loginMessage.textContent = data.message || "Login failed";
      return;
    }

    if (!data.success) {
      loginMessage.textContent = data.message || "Login failed";
      return;
    }

    window.location.href = "/driverDash.html";

  } catch (error) {
    console.error("Login request error:", error);
    loginMessage.textContent = "Could not connect to server";
  }
});