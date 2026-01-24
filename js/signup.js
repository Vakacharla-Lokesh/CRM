import { eventBus, EVENTS } from "../events/eventBus.js";
import { registerUser } from "../services/registerUser.js";
import { loadRoute } from "../router.js";

const signupForm = document.getElementById("signup-form");
const nameInput = document.getElementById("signup-name");
const emailInput = document.getElementById("signup-email");
const passwordInput = document.getElementById("signup-password");
const confirmPasswordInput = document.getElementById("signup-confirm-password");
const agreeTermsCheckbox = document.getElementById("agree-terms");
const submitBtn = document.getElementById("signup-submit");
const formError = document.getElementById("form-error");
const nameError = document.getElementById("name-error");
const emailError = document.getElementById("email-error");
const passwordError = document.getElementById("password-error");
const confirmPasswordError = document.getElementById("confirm-password-error");

function validateName(name) {
  return name && name.trim().length >= 2;
}

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePassword(password) {
  return password && password.length >= 6;
}

function validateConfirmPassword(password, confirmPassword) {
  return password === confirmPassword;
}

function clearErrors() {
  formError.classList.add("hidden");
  nameError.classList.add("hidden");
  emailError.classList.add("hidden");
  passwordError.classList.add("hidden");
  confirmPasswordError.classList.add("hidden");
}

function showError(field, message) {
  const errorElement = document.getElementById(field + "-error");
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.classList.remove("hidden");
  }
}

// Input validation on blur
nameInput.addEventListener("blur", () => {
  const name = nameInput.value.trim();
  if (name && !validateName(name)) {
    showError("name", "Name must be at least 2 characters");
  } else {
    nameError.classList.add("hidden");
  }
});

emailInput.addEventListener("blur", () => {
  const email = emailInput.value.trim();
  if (email && !validateEmail(email)) {
    showError("email", "Please enter a valid email address");
  } else {
    emailError.classList.add("hidden");
  }
});

passwordInput.addEventListener("blur", () => {
  const password = passwordInput.value;
  if (password && !validatePassword(password)) {
    showError("password", "Password must be at least 6 characters");
  } else {
    passwordError.classList.add("hidden");
  }
});

confirmPasswordInput.addEventListener("blur", () => {
  const password = passwordInput.value;
  const confirmPassword = confirmPasswordInput.value;
  if (confirmPassword && !validateConfirmPassword(password, confirmPassword)) {
    showError("confirm-password", "Passwords do not match");
  } else {
    confirmPasswordError.classList.add("hidden");
  }
});

// Clear errors on input
nameInput.addEventListener("input", () => {
  nameError.classList.add("hidden");
});

emailInput.addEventListener("input", () => {
  emailError.classList.add("hidden");
});

passwordInput.addEventListener("input", () => {
  passwordError.classList.add("hidden");
});

confirmPasswordInput.addEventListener("input", () => {
  confirmPasswordError.classList.add("hidden");
});

// Form submission
signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearErrors();

  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  const confirmPassword = confirmPasswordInput.value;
  const agreeTerms = agreeTermsCheckbox.checked;

  let hasErrors = false;

  // Validate name
  if (!name) {
    showError("name", "Name is required");
    hasErrors = true;
  } else if (!validateName(name)) {
    showError("name", "Name must be at least 2 characters");
    hasErrors = true;
  }

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

  // Validate confirm password
  if (!confirmPassword) {
    showError("confirm-password", "Please confirm your password");
    hasErrors = true;
  } else if (!validateConfirmPassword(password, confirmPassword)) {
    showError("confirm-password", "Passwords do not match");
    hasErrors = true;
  }

  // Validate terms
  if (!agreeTerms) {
    formError.textContent = "You must agree to the Terms & Conditions";
    formError.classList.remove("hidden");
    hasErrors = true;
  }

  if (hasErrors) return;

  // Disable submit button while processing
  submitBtn.disabled = true;
  submitBtn.textContent = "Creating Account...";

  try {
    // Register user
    const result = await registerUser(name, email, password);

    if (result.success) {
      // Emit user creation event
      eventBus.emit(EVENTS.USER_CREATED, {
        userId: result.user.userId,
        name: result.user.name,
        email: result.user.email,
      });

      // Show success message
      formError.textContent =
        "Account created successfully! Redirecting to login...";
      formError.classList.remove("hidden");
      formError.classList.remove("text-red-600");
      formError.classList.add("text-green-600");

      // Redirect to login after 2 seconds
      setTimeout(() => {
        window.router.loadRoute("/login");
      }, 2000);
    } else {
      formError.textContent =
        result.error || "Failed to create account. Please try again.";
      formError.classList.remove("hidden");
    }
  } catch (error) {
    console.error("Signup error:", error);
    formError.textContent = "An error occurred. Please try again later.";
    formError.classList.remove("hidden");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Create Account";
  }
});
