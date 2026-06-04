const loginForm    = document.getElementById("driverLoginForm");
const loginMessage = document.getElementById("loginMessage");

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  loginMessage.textContent = "";

  const loginData = {
    email:    document.getElementById("email").value,
    password: document.getElementById("password").value
  };

  try {
    const response = await fetch("/drivers/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(loginData)
    });

    const data = await response.json();

    if (!response.ok) {
      loginMessage.textContent = data.message || "Login failed";
      return;
    }

    // Redirect to dashboard on success
    window.location.href = "/driverDash";

  } catch (error) {
    console.error("Login error:", error);
    loginMessage.textContent = "Could not connect to server";
  }
});
