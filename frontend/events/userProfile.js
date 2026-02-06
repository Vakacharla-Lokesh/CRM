import userManager from "./handlers/userManager.js";

export function updateUserDetails() {
  let userData = userManager.getUser();
  if (!userData) {
    return;
  }
  // console.log(userData);
  const userProfile = `<div class="flex items-center gap-4 mb-6">
      <div
        class="flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 text-white text-lg font-semibold uppercase"
      >
        ${userData.user_name.slice(0, 1)}
      </div>
      <div class="flex flex-col">
        <span class="text-sm font-medium text-gray-900 dark:text-gray-100">
          ${userData.user_name}
        </span>
        <span class="text-xs text-gray-500 dark:text-gray-400">
          ${userData.role}
        </span>
      </div>
    </div>
    `;

  let userDetails = document.querySelector("#user-profile");
  userDetails.innerHTML = userProfile;
}
