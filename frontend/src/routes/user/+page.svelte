<script>
  import { onMount } from "svelte";
  import { PUBLIC_API_BASE_URL, PUBLIC_IMAGES_URL } from "$env/static/public";
  import "$lib/css/app.css";
  import { invalidateAll } from "$app/navigation";
  import { goto } from "$app/navigation";

  // State variables
  export let username = "";
  export let firstName = "";
  export let lastName = "";
  export let dob = "";
  export let bio = "";
  export let avatar = "";
  export let password = "";
  export let confirmPassword = "";

  let passwordMismatch = false;
  let userId = null; // Variable to hold the user ID
  let avatarFile = null;
  let avatarURL = avatar ? `${PUBLIC_IMAGES_URL}/avatars/${avatar}` : ""; // Initialize avatar URL
  let successMessage = ""; // State variable for success message
  let showDeleteConfirmation = false; // State variable for delete confirmation

  // Load current user info
  async function loadUserInfo() {
    try {
      const response = await fetch(`${PUBLIC_API_BASE_URL}/users/me`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to load user info: ${response.statusText}`);
      }

      const userData = await response.json();
      userId = userData.id; // Assign the user ID for updates
      username = userData.username || "";
      firstName = userData.fname || "";
      lastName = userData.lname || "";
      dob = userData.dateOfBirth || "";
      bio = userData.bio || "";
      // Only keep the filename in 'avatar'
      avatar = userData.avatar ? userData.avatar.replace(/^.*[\\/]/, "") : "";
      avatarURL = avatar ? `${PUBLIC_IMAGES_URL}/avatars/${avatar}` : ""; // Set the correct URL
    } catch (error) {
      console.error("Error loading user info:", error);
    }
  }

  onMount(() => {
    loadUserInfo();
  });

  // Function to update all user info
  async function updateUser() {
    if (!userId) {
      console.error("User ID not set.");
      return;
    }

    // Validate password and confirmPassword
    if (password && password !== confirmPassword) {
      passwordMismatch = true;
      return;
    } else {
      passwordMismatch = false;
    }

    // Create FormData object
    const formData = new FormData();
    formData.append("username", username);
    formData.append("fname", firstName);
    formData.append("lname", lastName);
    formData.append("dateOfBirth", dob);
    formData.append("bio", bio);

    if (avatarFile) {
      formData.append("avatar", avatarFile);
    }

    if (password) {
      formData.append("password", password);
    }

    try {
      console.log("Data to update:", formData);

      const response = await fetch(`${PUBLIC_API_BASE_URL}/users/${userId}`, {
        method: "PATCH",
        credentials: "include",
        body: formData
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        console.error("Error response from server:", errorResponse);
        throw new Error(`Failed to update user: ${response.statusText}`);
      }

      const updatedUser = await response.json();
      console.log("User info updated successfully.");

      // Trim leading "images/avatars/" from avatar
      if (updatedUser.avatar) {
        avatar = updatedUser.avatar.replace(/^images\/avatars\/+/, "");
        avatarURL = `${PUBLIC_IMAGES_URL}/avatars/${avatar}`; // Set correct avatarURL
      }

      successMessage = "User information updated successfully!";
      setTimeout(() => (successMessage = ""), 5000); // Clear the message after 5 seconds
      loadUserInfo();
      await invalidateAll();
      goto("/"); // Refresh user info
    } catch (error) {
      console.error("Error updating user:", error);
      successMessage = "Failed to update user information.";
      setTimeout(() => (successMessage = ""), 5000); // Clear the message after 5 seconds
    }
  }

  // Function to handle delete confirmation
  function confirmDelete() {
    showDeleteConfirmation = true;
  }

  // Function to cancel delete
  function cancelDelete() {
    showDeleteConfirmation = false;
  }

  // Function to delete user
  async function deleteUser() {
    if (!userId) {
      console.error("User ID not set.");
      return;
    }

    try {
      const response = await fetch(`${PUBLIC_API_BASE_URL}/users/me/${userId}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        console.error("Error response from server:", errorResponse);
        throw new Error(`Failed to delete user: ${response.statusText}`);
      }

      console.log("Account deleted successfully!");
      successMessage = "Account deleted successfully!";
      setTimeout(() => {
        successMessage = "";
        window.location.href = "/"; // Redirect after clearing the message
      }, 5000);
    } catch (error) {
      console.error("Error deleting user:", error);
      successMessage = "Failed to delete user.";
      setTimeout(() => (successMessage = ""), 5000); // Clear the message after 5 seconds
    }
  }

  // Check if passwords match
  function checkPasswordMatch() {
    passwordMismatch = password && confirmPassword && password !== confirmPassword;
  }

  // Handle file input change for avatar
  function handleAvatarChange(event) {
    avatarFile = event.target.files[0];
    if (avatarFile) {
      // Revoke the old object URL before creating a new one
      if (avatarURL.startsWith("blob:")) {
        URL.revokeObjectURL(avatarURL);
      }
      avatarURL = URL.createObjectURL(avatarFile); // Create a blob URL for local preview
    }
  }
</script>

<div class="body">
  <div class="edit-container">
    <div class="edit-title">Edit User Information</div>

    <!-- Avatar -->
    <div class="form-group avatar-group">
      <label for="avatar">Avatar</label>
      <img src={avatarURL} alt="Avatar Preview" class="avatar-preview" />
      <input
        type="file"
        accept="image/*"
        id="avatar"
        name="avatar"
        on:change={handleAvatarChange}
      />
    </div>

    <!-- Username -->
    <div class="form-group">
      <label for="username">Username</label>
      <input type="text" id="username" name="username" bind:value={username} />
    </div>

    <!-- First Name -->
    <div class="form-group">
      <label for="firstName">First Name</label>
      <input type="text" id="firstName" name="firstName" bind:value={firstName} />
    </div>

    <!-- Last Name -->
    <div class="form-group">
      <label for="lastName">Last Name</label>
      <input type="text" id="lastName" name="lastName" bind:value={lastName} />
    </div>

    <!-- Date of Birth -->
    <div class="form-group">
      <label for="dob">Date of Birth</label>
      <input type="date" id="dob" name="dob" bind:value={dob} />
    </div>

    <!-- Bio -->
    <div class="form-group">
      <label for="bio">Bio</label>
      <textarea id="bio" name="bio" bind:value={bio}></textarea>
    </div>

    <!-- Password -->
    <div class="form-group">
      <label for="password">New Password</label>
      <input
        type="password"
        id="password"
        name="password"
        bind:value={password}
        on:input={checkPasswordMatch}
      />
    </div>

    <!-- Confirm Password -->
    <div class="form-group">
      <label for="confirmPassword">Confirm New Password</label>
      <input
        type="password"
        id="confirmPassword"
        name="confirmPassword"
        bind:value={confirmPassword}
        on:input={checkPasswordMatch}
      />
      {#if passwordMismatch}
        <div class="error-message">Passwords do not match!</div>
      {/if}
    </div>

    <!-- Save Changes and Delete User Buttons -->
    <div class="form-group buttons">
      <button on:click={updateUser}>Save Changes</button>
      <button class="delete-btn" on:click={confirmDelete}>Delete User</button>
    </div>

    <!-- Delete confirmation -->
    {#if showDeleteConfirmation}
      <div class="confirmation-message">
        Are you sure you want to delete this account?
        <button on:click={deleteUser}>Yes</button>
        <button on:click={cancelDelete}>No</button>
      </div>
    {/if}

    <!-- Success message span -->
    {#if successMessage}
      <span class="success-message">{successMessage}</span>
    {/if}
  </div>
</div>

<style>
  .body {
    background-image: url("dark-anime3.png");
    padding-bottom: 2rem;
  }

  .edit-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px;
    width: 50%;
    max-width: 1000px;
    margin: 20px auto;
    border-radius: 15px;
    background: linear-gradient(135deg, #f4d2d9, #e7959f);
    box-shadow: 0px 8px 20px rgba(0, 0, 0, 0.25);
    border: 2px solid #dd6677;
    transition: transform 0.3s, box-shadow 0.3s;
  }

  .edit-container:hover {
    transform: scale(1.02);
    box-shadow: 0px 12px 24px rgba(0, 0, 0, 0.3);
  }

  .edit-title {
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 20px;
    text-align: center;
    color: #333;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    margin-bottom: 15px;
    width: 100%;
    max-width: 400px;
    padding: 10px;
    background-color: #f7e5e8;
    border: 1px solid #e1a3ad;
    border-radius: 8px;
    box-shadow: inset 0px 1px 5px rgba(0, 0, 0, 0.1);
  }

  .form-group.avatar-group {
    align-items: center;
    justify-content: center;
  }

  .form-group label {
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 5px;
    color: #555;
  }

  .form-group input,
  .form-group textarea {
    width: 100%;
    padding: 8px;
    font-size: 16px;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-sizing: border-box;
    margin-bottom: 5px;
  }

  .avatar-preview {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background-color: #ddd;
    background-size: cover;
    background-position: center;
    overflow: hidden;
    margin-bottom: 10px; /* Add margin for spacing */
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  }

  .success-message {
    margin-top: 10px;
    font-size: 14px;
    color: green;
  }

  .error-message {
    color: red;
    font-size: 14px;
    margin-top: 5px;
  }

  .buttons {
    display: flex;
    gap: 10px;
    margin-top: 20px;
  }

  button {
    padding: 8px 12px;
    font-size: 14px;
    cursor: pointer;
    border: none;
    border-radius: 4px;
    background-color: #4caf50;
    color: white;
    box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
    transition: background-color 0.3s, box-shadow 0.3s;
  }

  button:hover {
    background-color: #45a049;
    box-shadow: 0px 6px 10px rgba(0, 0, 0, 0.15);
  }

  .delete-btn {
    background-color: #f44336;
  }

  .delete-btn:hover {
    background-color: #d32f2f;
  }

  .confirmation-message {
    margin-top: 10px;
    font-size: 14px;
    color: red;
  }

  .confirmation-message button {
    margin: 5px;
    padding: 5px 10px;
    font-size: 12px;
    border-radius: 4px;
    background-color: #f44336;
    color: white;
    transition: background-color 0.3s;
  }

  .confirmation-message button:hover {
    background-color: #d32f2f;
  }
</style>
