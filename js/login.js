import { eventBus, EVENTS } from "../events/eventBus.js";
import { loadRoute } from "../router.js";
import { checkUserLogin } from "../services/checkUserLogin.js";

const loginForm = document.getElementById("login-form");
const emailInput = document.getElementById("login-email");
const passwordInput = document.getElementById("login-password");
const rememberCheckbox = document.getElementById("remember-me");
const submitBtn = document.getElementById("login-submit");
const formError = document.getElementById("form-error");
const emailError = document.getElementById("email-error");
const passwordError = document.getElementById("password-error");

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePassword(password) {
  return password && password.length >= 6;
}

function clearErrors() {
  formError.classList.add("hidden");
  emailError.classList.add("hidden");
  passwordError.classList.add("hidden");
}

function showError(field, message) {
  const errorElement = document.getElementById(field + "-error");
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.classList.remove("hidden");
  }
}

// Email validation on blur
emailInput.addEventListener("blur", () => {
  const email = emailInput.value.trim();
  if (email && !validateEmail(email)) {
    showError("email", "Please enter a valid email address");
  } else {
    emailError.classList.add("hidden");
  }
});

// Password validation on blur
passwordInput.addEventListener("blur", () => {
  const password = passwordInput.value;
  if (password && !validatePassword(password)) {
    showError("password", "Password must be at least 6 characters");
  } else {
    passwordError.classList.add("hidden");
  }
});

// Clear errors on input
emailInput.addEventListener("input", () => {
  if (emailError.classList.contains("visible")) {
    emailError.classList.add("hidden");
  }
});

passwordInput.addEventListener("input", () => {
  if (passwordError.classList.contains("visible")) {
    passwordError.classList.add("hidden");
  }
});

// Form submission
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearErrors();

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  let hasErrors = false;

  // Validate email
  if (!email) {
    showError("email", "Email is required");
    hasErrors = true;
  } else if (!validateEmail(email)) {
    showError("email", "Please enter a valid email address");
    hasErrors = true;
  }

  // Validate password
  if (!password) {
    showError("password", "Password is required");
    hasErrors = true;
  } else if (!validatePassword(password)) {
    showError("password", "Password must be at least 6 characters");
    hasErrors = true;
  }

  if (hasErrors) return;

  // Disable submit button while processing
  submitBtn.disabled = true;
  submitBtn.textContent = "Signing in...";

  try {
    // Check user credentials from IndexedDB
    const result = await checkUserLogin(email, password);

    if (result.success) {
      // Store auth information
      localStorage.setItem("authToken", result.user.userId);
      localStorage.setItem("userId", result.user.userId);
      localStorage.setItem("userName", result.user.name);

      if (rememberCheckbox.checked) {
        localStorage.setItem("rememberEmail", email);
      } else {
        localStorage.removeItem("rememberEmail");
      }

      eventBus.emit(EVENTS.LOGIN_SUCCESS, {
        email,
        userId: result.user.userId,
        name: result.user.name,
      });
    } else {
      formError.textContent = result.error || "Login failed. Please try again.";
      formError.classList.remove("hidden");
    }
  } catch (error) {
    console.error("Login error:", error);
    formError.textContent = "An error occurred. Please try again later.";
    formError.classList.remove("hidden");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Sign In";
  }
});

function attachSignUpListener() {
  const rememberedEmail = localStorage.getItem("rememberEmail");
  if (rememberedEmail) {
    const emailField = document.getElementById("login-email");
    if (emailField) {
      emailField.value = rememberedEmail;
      const rememberCheckboxField = document.getElementById("remember-me");
      if (rememberCheckboxField) {
        rememberCheckboxField.checked = true;
      }
    }
  }

  let signUpBtn = document.querySelector("#sign-up-btn");
  if (signUpBtn) {
    signUpBtn.addEventListener("click", (event) => {
      event.preventDefault();
      const path = signUpBtn.getAttribute("data-link");
      loadRoute(path);
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  console.log("Inside dom content loaded fn in login js");
  attachSignUpListener();
});

attachSignUpListener();

loginForm.addEventListener("click", (event) => {
  console.log("Inside login form");
});
