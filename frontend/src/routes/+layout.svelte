<script>
  import { page } from "$app/stores";
  import { invalidateAll } from "$app/navigation";
  import { BASE_URL } from "$lib/js/api-urls.js";

  const LOGOUT_URL = `${BASE_URL}/logout`;

  $: path = $page.url.pathname;
  export let data;

  async function handleLogout() {
    const response = await fetch(LOGOUT_URL, {
      method: "DELETE",
      credentials: "include"
    });
    await invalidateAll();
  }
</script>

<svelte:head>
  <title>Cheery Cats' Anime</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link
    href="https://fonts.googleapis.com/css2?family=Bangers&family=Luckiest+Guy&family=Righteous&family=Roboto+Slab:wght@100..900&family=Yeseva+One&display=swap"
    rel="stylesheet"
  />
</svelte:head>

<nav class="navbar">
  {#if data.isLoggedIn}
    <div class="nav-left">
      <img src={`http://localhost:3000${data.user.avatar}`} alt="icon" />
      <p>{data.user.username}</p>
    </div>
    <div class="nav-right">
      <a href="/">Home</a>
      <a href="/search">Search</a>
      <a href="/my-articles">My Articles</a>
      <a href="/user">Edit Profile</a>
      <a href="/article">Create Article</a>
      <a href="/" on:click={handleLogout}>Logout</a>
    </div>
  {:else}
    <div class="nav-left"></div>
    <div class="nav-right">
      <a href="/">Home</a>
      <a href="/search">Search</a>
      <a href="/login" class:active={path.startsWith("/login")}>Login</a>
    </div>
  {/if}
</nav>

<slot />

<footer class="footer">
  <p>© 2024 • Made with love ❤️ by:</p>
  <ul>
    <li><a href="https://github.com/RizkiPutra660" target="_blank">Rizki</a></li>
    <li><a href="https://github.com/m-juang" target="_blank">Juang</a></li>
    <li><a href="https://github.com/tarakpatel1000" target="_blank">Tarak</a></li>
    <li><a href="https://github.com/Jibin6713" target="_blank">Jibin</a></li>
  </ul>
</footer>

<style>
  /* Navbar styling */
  nav {
    font-family: "Luckiest Guy", cursive;
    background-color: #1e1e1e;
    color: #fff;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 5%;
    letter-spacing: 0.05rem;
  }

  .nav-left,
  .nav-right {
    display: flex;
    align-items: center;
  }

  nav p {
    margin-left: 1rem;
  }

  nav a {
    color: #fff;
    margin-right: 1rem;
    text-decoration: none;
  }

  nav a:hover {
    text-decoration: underline;
  }

  img {
    border-radius: 50%;
    width: 50px;
    height: 50px;
  }

  /* Footer styling */
  .footer {
    font-family: "Roboto Slab", sans-serif;
    background-color: #1e1e1e;
    color: #fff;
    padding: 0.5rem 5%;
    text-align: center;
    font-size: 0.85rem;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
  }

  .footer p {
    margin: 0;
    font-weight: bold;
    margin-right: 0.5rem;
  }

  .footer ul {
    display: inline-flex;
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .footer li {
    margin: 0 0.5rem;
  }

  .footer a {
    color: #aaa;
    text-decoration: none;
    font-weight: normal;
  }

  .footer a:hover {
    text-decoration: underline;
  }
</style>
