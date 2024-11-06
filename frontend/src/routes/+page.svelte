<script>
  // This is Home Page
  import { onMount } from "svelte";
  import Article from "$lib/components/ArticleSummary.svelte";
  import "$lib/css/app.css";
  import { ARTICLE_URL } from "$lib/js/api-urls.js";

  let articles = [];
  let sortedArticles = [];
  let currentSort = { criteria: "title", order: "asc" }; // Default sorting

  export let data;

  async function fetchArticles() {
    const url = ARTICLE_URL;
    const response = await fetch(url);
    const data = await response.json();
    console.log(data);

    articles = data;
    sortArticles(currentSort.criteria, currentSort.order); // Initial sorting
  }

  function sortArticles(criteria, order) {
    currentSort = { criteria, order };

    sortedArticles = [...articles].sort((a, b) => {
      let comparison = 0;
      if (criteria === "title") {
        comparison = a.title.localeCompare(b.title);
      } else if (criteria === "username") {
        comparison = a.username.localeCompare(b.username);
      } else if (criteria === "date") {
        comparison = new Date(a.date) - new Date(b.date);
      }

      return order === "asc" ? comparison : -comparison;
    });
  }

  onMount(fetchArticles);
</script>

<section class="body">
  <section class="blog-header">
    <div class="header-content">
      {#if data.isLoggedIn}
        <h1 class="title">Welcome {data.user.username}!</h1>
        <a href="/article" class="sign-up-btn">Write Now!</a>
      {:else}
        <h1 class="title">CHEERY CATS' ANIME</h1>
        <p class="subtitle">Your Gateway to the World of Anime Characters</p>
        <a href="/register" class="sign-up-btn">Sign Up Now!</a>
      {/if}
    </div>
  </section>

  <section class="recent-posts">
    <div class="sort-container">
      <h2>Recent blog posts</h2>
      <div class="sort-controls">
        <label for="sort-criteria">Sort by:</label>

        <!-- Dropdown Sort Criteria -->
        <select
          id="sort-criteria"
          on:change={(e) => sortArticles(e.target.value, currentSort.order)}
          class="sort-dropdown"
          aria-label="Sort by criteria"
        >
          <option value="title" selected={currentSort.criteria === "title"}>TITLE</option>
          <option value="username" selected={currentSort.criteria === "username"}>USERNAME</option>
          <option value="date" selected={currentSort.criteria === "date"}>DATE</option>
        </select>

        <label for="sort-order" class="visually-hidden">Sort order:</label>
        <!-- Dropdown Sort Order -->
        <select
          id="sort-order"
          on:change={(e) => sortArticles(currentSort.criteria, e.target.value)}
          class="sort-dropdown"
          aria-label="Sort order"
        >
          <option value="asc" selected={currentSort.order === "asc"}>ASCENDING</option>
          <option value="desc" selected={currentSort.order === "desc"}>DESCENDING</option>
        </select>
      </div>
    </div>

    <div class="article-grid">
      {#each sortedArticles as article}
        <a href={`/article/${article.article_id}`} class="article-link rgb"><Article {article} /></a
        >
      {/each}
    </div>
  </section>
</section>

<style>
  @import url("https://fonts.googleapis.com/css2?family=Roboto:wght@400;500&display=swap");
  .body {
    background-image: url("dark-anime.png");
  }

  .blog-header {
    color: white;
    text-align: left;
    padding: 4rem 0;
    background-size: cover;
    background-position: center;
    margin-left: 5%;
    margin-right: 5%;
    display: flex;
    align-items: center;
    justify-content: flex-start;
  }

  .header-content {
    margin-left: 5%;
  }

  .title {
    font-family: "Bangers", system-ui;
    font-style: normal;
    font-size: 8rem;
    font-weight: bold;
    letter-spacing: 0.1em;
    margin: 0;
    padding: 0;
    text-shadow: 4px 4px 8px rgba(0, 0, 0, 0.8);
    text-transform: uppercase;
    color: #e0e0e0;
  }

  .subtitle {
    font-family: "Bangers", system-ui;
    font-size: 2rem;
    color: #a8a8a8;
    margin-top: 1rem;
    font-style: italic;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
  }

  .sign-up-btn {
    font-family: "Bangers", system-ui;
    display: inline-block;
    margin-top: 2rem;
    padding: 0.8rem 2rem;
    font-size: 1.5rem;
    border: 2px solid rgba(255, 255, 255, 0.8);
    border-radius: 30px;
    background-color: #1a2a44;
    color: white;
    cursor: pointer;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    transition:
      background-color 0.3s ease,
      color 0.3s ease,
      box-shadow 0.3s ease;
    text-decoration: none; /* Remove underline */
  }

  .sign-up-btn:hover {
    background-color: #3a86ff;
    color: #fff;
    box-shadow: 0px 0px 10px rgba(255, 255, 255, 0.5);
  }

  .sign-up-btn:focus {
    outline: none;
    box-shadow: 0px 0px 10px rgba(255, 255, 255, 0.5);
  }

  .recent-posts {
    font-family: "Roboto Slab", serif;
    padding-top: 2rem;
    color: #fff;
    margin-left: 5%;
    margin-right: 5%;
  }

  .sort-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  .sort-controls {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .sort-dropdown {
    padding: 0.5rem;
    border-radius: 8px;
    background-color: #ffffff; /* Light purple background */
    color: #333; /* Dark text for contrast */
    font-family: "Roboto", sans-serif; /* Font set to Roboto */
    font-weight: 500; /* Medium weight for better readability */
    border: none; /* Removed the border */
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2); /* Soft shadow to lift the element */
    transition:
      background 0.3s ease,
      transform 0.2s ease;
    outline: none;
  }

  /* Hover Effect */
  .sort-dropdown:hover {
    background-color: #b8ddfb; /* Slightly darker light purple on hover */
    transform: translateY(-2px);
    cursor: pointer;
  }

  /* Style for individual options */
  .sort-dropdown option {
    background-color: #ffffff; /* White background for options */
    color: #333; /* Dark text for readability */
    font-family: "Roboto", sans-serif; /* Consistency in font */
    font-weight: 400; /* Normal weight for options */
    padding: 0.5rem;
  }

  /* Hover and Selected option styling */
  .sort-dropdown option:hover,
  .sort-dropdown option:checked {
    background-color: #f0f0f0; /* Light gray background on hover */
    color: #333;
  }

  label[for="sort-criteria"] {
    color: #f5f5f5; /* Black color for the label */
    font-family: "Roboto", sans-serif; /* Font family for consistency */
    font-weight: 500; /* Medium weight for better readability */
    margin-right: 0.5rem; /* Spacing between label and dropdown */
    border-color: black;
  }

  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  .article-grid {
    /* display: grid;
    grid-template-columns: repeat(3, 1fr); */
    gap: 1rem;
    columns: 300px;
  }

  a {
    text-decoration: none;
    color: #fff;
  }

  .article-link {
    transition: transform 0.2s;
    color: #fff;
    text-decoration: none;
    display: inline-block;
    position: relative;
  }

  .article-link:hover {
    transform: translateY(-5px);
  }
</style>
