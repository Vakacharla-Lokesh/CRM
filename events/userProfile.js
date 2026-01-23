export function updateUserDetails() {
  let userData = JSON.parse(localStorage.getItem("user"));
  // console.log(userData);
  const userProfile = `<div class="flex items-center gap-4 mb-6">
      <div
        class="flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 text-white text-lg font-semibold uppercase"
      >
        ${userData.user_name.slice(0, 1)}
      </div>
      <div>
        <p class="text-2xl font-medium text-white">
          ${userData.user_name}
        </p>
      </div>
    </div>
    `;

  let userDetails = document.querySelector("#user-profile");
  userDetails.innerHTML = userProfile;
}