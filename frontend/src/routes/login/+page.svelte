<script>
  import { goto } from "$app/navigation";
  import { BASE_URL } from "$lib/js/api-urls.js";
  import "$lib/css/app.css";

  // This is Login page
  let username = "";
  let password = "";
  let error = false;

  const LOGIN_URL = `${BASE_URL}/login`;

  // Function to handle form submission
  async function handleSubmit() {
    error = false;
    const response = await fetch(LOGIN_URL, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    if (response.status === 401) {
      error = true;
    } else {
      goto("/", { invalidateAll: true, replaceState: true });
    }
  }
</script>

<div class="body">
  <div class="login-container">
    <div class="login-box">
      <h2>Login</h2>
      <form on:submit|preventDefault={handleSubmit}>
        <div class="form-group">
          <label for="username">Username:</label>
          <input type="text" id="username" bind:value={username} required />
        </div>

        <div class="form-group">
          <label for="password">Password:</label>
          <input type="password" id="password" bind:value={password} required />
        </div>

        <button type="submit" class="login-button">Log in</button>
        {#if error}
          <span class="error">Could not log in with those credentials, please try again.</span>
        {/if}
      </form>

      <p class="register-info">
        Don’t have an account?<br />
        Click Here to <a href="/register">Register</a>
      </p>
    </div>
  </div>
</div>

<style>
  /* Background styling */

  .body {
    background-image: url("dark-anime6.jpeg"); /* Replace with your image path */
  }

  .login-container {
    height: 90vh;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  /* Login box styling */
  .login-box {
    background: rgba(234, 232, 232, 0.85);
    padding: 2rem;
    border-radius: 10px;
    width: 320px;
    box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.2);
    text-align: center;
  }

  h2 {
    margin-bottom: 1rem;
    font-family: "Yeseva One", serif;
    letter-spacing: 0.05em;
    font-size: 2rem;
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

  input {
    width: 92%;
    padding: 0.75rem;
    border: 1px solid #ccc;
    border-radius: 5px;
    font-size: 1rem;
    box-shadow: inset 0px 2px 5px rgba(0, 0, 0, 0.1);
  }

  /* Button styling */
  .login-button {
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

  .login-button:hover {
    background-color: #ea2452;
  }

  /* Register info styling */
  .register-info {
    font-family: "Righteous", sans-serif;
    margin-top: 2rem;
    font-size: 0.9rem;
    color: #333;
  }

  .register-info a {
    color: #ff6f91;
    text-decoration: none;
    font-weight: bold;
  }

  .register-info a:hover {
    text-decoration: underline;
  }

  span {
    color: red;
  }
</style>
