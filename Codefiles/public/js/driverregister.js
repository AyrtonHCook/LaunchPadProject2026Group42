const driverRegisterForm = document.getElementById("driverRegisterForm");
const registerMessage = document.getElementById("registerMessage");

driverRegisterForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  registerMessage.textContent = "";

  const fullName = document.getElementById("fullName").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  if (!fullName || !email || !password || !confirmPassword) {
    registerMessage.textContent = "All fields are required";
    return;
  }

  if (password !== confirmPassword) {
    registerMessage.textContent = "Passwords do not match";
    return;
  }

  if (password.length < 4) {
    registerMessage.textContent = "Password must be at least 4 characters";
    return;
  }

  try {
    const response = await fetch("/drivers/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        fullName,
        email,
        password
      })
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      registerMessage.textContent = data.message || "Registration failed";
      return;
    }

    registerMessage.textContent = "Account created successfully. Redirecting to login...";

    setTimeout(() => {
      window.location.href = "/driver.html";
    }, 1000);

  } catch (error) {
    console.error("Register error:", error);
    registerMessage.textContent = "Could not connect to server";
  }
});