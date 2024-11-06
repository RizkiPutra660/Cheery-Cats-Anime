<script>
  import "$lib/css/app.css";
  import { goto } from "$app/navigation";
  import { USER_URL } from "$lib/js/api-urls.js";

  let username = "";
  let fname = "";
  let lname = "";
  let dateOfBirth = "";
  let bio = "";
  let password = "";
  let confirmPassword = "";
  let avatars = [
    "/images/avatars/inosuke.png",
    "/images/avatars/tanjiro.png",
    "/images/avatars/nezuko.png",
    "/images/avatars/zenitsu.png",
    "/images/avatars/kanao.png"
  ];
  let avatar = avatars[0];
  let uploadedAvatar = null;

  $: passwordsMatch = password === confirmPassword;

  let usernameError = false;
  let usernameTaken = false;
  let passwordError = false;
  let error = false;
  let success = false;

  // Username validation
  $: usernameValid = /^[A-Za-z0-9]{4,}$/.test(username) && !username.includes(" ");
  $: if (!usernameValid && username !== "") {
    usernameError = "Username must be 4+ characters, no spaces allowed.";
  } else {
    usernameError = false;
  }

  // Password validation
  $: passwordValid = /^(?=.*\d)(?=.*[!-\/:-@[-`{-~])[A-Za-z\d!-\/:-@[-`{-~]{5,}$/.test(password);
  $: if (!passwordValid && password !== "") {
    passwordError = "Password must be 5+ characters, with 1 special character and 1 number.";
  } else {
    passwordError = false;
  }

  async function checkUsernameAvailability() {
    if (usernameValid) {
      const response = await fetch(`${USER_URL}/check-username`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username })
      });

      if (response.status === 409) {
        usernameTaken = true;
      } else {
        usernameTaken = false;
      }
    }
  }

  function onDateInput(event) {
    // Restrict year to 4 digits if user types it manually
    const date = event.target.value;
    const parts = date.split("-");
    if (parts.length === 3 && parts[0].length > 4) {
      parts[0] = parts[0].slice(0, 4); // Limit year to 4 digits
      event.target.value = parts.join("-");
      dateOfBirth = event.target.value; // Update the dateOfBirth variable
    }
  }

  async function handleRegister() {
    let formData = new FormData();
    formData.append("username", username);
    formData.append("password", password);
    formData.append("fname", fname);
    formData.append("lname", lname);
    formData.append("dateOfBirth", dateOfBirth);
    formData.append("bio", bio);

    if (uploadedAvatar) {
      formData.append("avatar", uploadedAvatar);
    } else {
      formData.append("avatar", avatar);
    }

    const response = await fetch(`${USER_URL}/register`, {
      method: "POST",
      credentials: "include",
      body: formData
    });

    success = response.status === 201;
    error = !success;

    if (response.status === 409) {
      usernameTaken = true;
    }

    if (success) {
      goto("/login");
    }
  }
</script>

<div class="body">
  <div class="register-container">
    <div class="register-box">
      <h2>New Account</h2>
      <form on:submit|preventDefault={handleRegister}>
        <div class="form-group">
          <label for="username">Username:</label>
          <input
            type="text"
            id="username"
            bind:value={username}
            placeholder="Enter Username (4+ char, no spaces)"
            required
            on:blur={checkUsernameAvailability}
          />
          {#if usernameError}
            <span class="error">{usernameError}</span>
          {/if}
          {#if usernameTaken}
            <span class="error">Username is already taken!</span>
          {/if}
        </div>

        <div class="form-group">
          <label for="password">Password:</label>
          <input
            type="password"
            id="password"
            bind:value={password}
            placeholder="(5+ char, 1 special char, 1 number)"
            required
          />
          {#if passwordError}
            <span class="error">{passwordError}</span>
          {/if}
        </div>

        <div class="form-group">
          <label for="confirm-password">Confirm Password:</label>
          <input type="password" id="confirm-password" bind:value={confirmPassword} required />
          {#if confirmPassword != "" && !passwordsMatch}
            <span>Passwords must match!</span>
          {/if}
        </div>

        <h3>A bit about yourself</h3>

        <div class="form-group">
          <label for="fname">Firstname:</label>
          <input type="text" id="fname" bind:value={fname} required />
        </div>

        <div class="form-group">
          <label for="lname">Lastname:</label>
          <input type="text" id="lname" bind:value={lname} />
        </div>

        <div class="form-group">
          <label for="dob">Date of Birth:</label>
          <input type="date" id="dob" bind:value={dateOfBirth} on:input={onDateInput} required />
        </div>

        <div class="form-group">
          <label for="bio">Description:</label>
          <textarea id="bio" bind:value={bio} placeholder="A few words about yourself" rows="3"
          ></textarea>
        </div>

        <p>Please choose an avatar below:</p>
        <div class="avatar-selection">
          {#each avatars as avatarOption}
            <label class="avatar-option">
              <input type="radio" name="avatar" value={avatarOption} bind:group={avatar} />
              <img src={`http://localhost:3000${avatarOption}`} alt={avatarOption} />
            </label>
          {/each}
        </div>

        <p>Or upload your own avatar:</p>
        <label>
          <input
            type="file"
            multiple={false}
            name="image-file"
            accept="image/png, image/jpeg"
            on:change={(e) => (uploadedAvatar = e.target.files[0])}
          />
        </label>

        <button type="submit" class="register-button">Create Account</button>
        {#if error}<span class="error">Could Not Register!</span>{/if}
        {#if success}<span class="success">Account Created!</span>{/if}
      </form>

      <p class="login-info">
        Already have an account? <br />
        Click here to <a href="/login">Login</a>
      </p>
    </div>
  </div>
</div>

<style>
  /* Background styling */

  .body {
    background-image: url("dark-anime7.jpeg");
  }

  .register-container {
    display: flex;
    justify-content: center;
    align-items: center;
    padding-top: 10px;
    padding-bottom: 10px;
  }

  /* Register box styling */
  .register-box {
    background: rgba(234, 232, 232, 0.85);
    padding: 2rem;
    border-radius: 10px;
    width: 400px;
    box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.2);
    text-align: center;
  }

  h2 {
    margin-bottom: 1rem;
    font-family: "Yeseva One", serif;
    letter-spacing: 0.05em;
    font-size: 2rem;
  }

  h3 {
    margin-top: 2rem;
    font-family: "Yeseva One", serif;
    letter-spacing: 0.05em;
    font-size: 1.5rem;
  }

  /* Form group styling */
  .form-group {
    font-family: "Righteous", sans-serif;
    letter-spacing: 0.05em;
    margin-bottom: 1.5rem;
    text-align: left;
  }

  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: bold;
  }

  input,
  textarea {
    width: 92%;
    padding: 0.75rem;
    border: 1px solid #ccc;
    border-radius: 5px;
    font-size: 1rem;
    box-shadow: inset 0px 2px 5px rgba(0, 0, 0, 0.1);
  }

  /* Avatar selection styling */
  .avatar-selection {
    margin-top: 1rem;
    display: flex;
    justify-content: space-between;
    margin-bottom: 2rem;
  }

  .avatar-option {
    position: relative;
    cursor: pointer;
  }

  .avatar-option img {
    width: 70px;
    height: 70px;
    border-radius: 50%;
    border: 2px solid transparent;
    transition: border 0.3s;
  }

  .avatar-option input[type="radio"] {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    opacity: 0;
    cursor: pointer;
  }

  /* Highlight the selected avatar */
  .avatar-option input[type="radio"]:checked + img {
    border: 2px solid #e82c58;
  }

  .avatar-option:hover img {
    border: 2px solid #fd83a0;
  }

  /* Button styling */
  .register-button {
    font-family: "Righteous", sans-serif;
    width: 100%;
    padding: 0.75rem;
    background-color: #ff6f91;
    color: white;
    border: none;
    border-radius: 5px;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.3s;
  }

  .register-button:hover {
    background-color: #ea2452;
  }

  /* Login info styling */
  .login-info {
    font-family: "Righteous", sans-serif;
    margin-top: 2rem;
    font-size: 0.9rem;
    color: #333;
  }

  .login-info a {
    color: #ff6f91;
    text-decoration: none;
    font-weight: bold;
  }

  .login-info a:hover {
    text-decoration: underline;
  }

  span {
    color: red;
  }

  p {
    font-family: "Righteous", sans-serif;
  }
</style>
