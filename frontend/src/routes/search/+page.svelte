<script>
  import { onMount } from "svelte";
  import Article from "$lib/components/ArticleSummary.svelte";
  import { ARTICLE_URL } from "$lib/js/api-urls.js";
  import "$lib/css/app.css";

  let articles = [];
  let searchQuery = "";

  async function fetchArticles() {
    const url = `${ARTICLE_URL}?search=${encodeURIComponent(searchQuery)}`;
    const response = await fetch(url);
    const data = await response.json();
    articles = data;

    sortArticles(currentSort.criteria, currentSort.order);
  }

  function handleSearch() {
    fetchArticles();
  }

  let sortedArticles = [];
  let currentSort = { criteria: "title", order: "asc" };

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
  <section class="search-header">
    <h1 class="title">Search Articles</h1>
    <div class="centered-search">
      <form on:submit|preventDefault class="search-form">
        <input
          type="text"
          class="search-input"
          bind:value={searchQuery}
          placeholder="Search any keyword"
          on:input={fetchArticles}
        />
        <button type="submit" class="search-button">
          <img src="search-icon.png" alt="Search Icon" />
        </button>
      </form>
    </div>
  </section>

  <section class="recommended-articles">
    <div class="articles-header">
      <h2>Recommended Articles</h2>
      <div class="sort-controls">
        <label for="sort-criteria">Sort by:</label>
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
    {#if articles.length > 0}
      <div class="article-grid">
        {#each sortedArticles as article}
          <a href={`/article/${article.article_id}`} class="article-link"><Article {article} /></a>
        {/each}
      </div>
    {:else}
      <div class="no-articles">
        <p>No articles found. Try a different search.</p>
      </div>
    {/if}
  </section>
</section>

<style>
  .body {
    background-image: url("dark-anime2.jpeg");
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
  }

  .search-header {
    text-align: center;
    padding: 1rem 0;
    border-bottom: 2px solid white;
    margin-left: 5%;
    margin-right: 5%;
  }

  .title {
    font-family: "Bangers", system-ui;
    letter-spacing: 0.1em;
    color: white;
    font-size: 3rem;
    font-weight: normal;
    margin-bottom: 1rem;
  }

  .centered-search {
    display: flex;
    justify-content: center;
    margin-bottom: 1rem;
  }

  .search-form {
    display: flex;
    width: 70%; /* Increased width for a longer search bar */
  }

  .search-input {
    padding: 0.8rem 1rem;
    border-radius: 25px 0 0 25px;
    border: none;
    background-color: #333;
    color: white;
    width: 100%;
    font-size: 1.2rem;
    outline: none;
  }

  .search-button {
    background-color: #444;
    border-radius: 0 25px 25px 0;
    padding: 0.8rem 1.5rem;
    border: none;
    cursor: pointer;
  }

  .search-button img {
    width: 20px;
    height: 20px;
  }

  .recommended-articles {
    font-family: "Roboto Slab", serif;
    padding-top: 2rem;
    color: #fff;
    margin-left: 5%;
    margin-right: 5%;
    min-height: 300px;
    display: flex;
    flex-direction: column;
  }

  .articles-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .sort-controls {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  #sort-criteria {
    padding: 0.5rem;
    border-radius: 4px;
  }

  #sort-order {
    padding: 0.5rem;
    border-radius: 4px;
  }
  .sort-dropdown {
    padding: 0.5rem;
    border-radius: 8px;
    background-color: #ffffff; /* Light purple background */
    color: #333; /* Dark text for contrast */
    font-family: 'Roboto', sans-serif; /* Font set to Roboto */
    font-weight: 500; /* Medium weight for better readability */
    border: none; /* Removed the border */
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2); /* Soft shadow to lift the element */
    transition: background 0.3s ease, transform 0.2s ease;
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
    font-family: 'Roboto', sans-serif; /* Consistency in font */
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
    font-family: 'Roboto', sans-serif; /* Font family for consistency */
    font-weight: 500; /* Medium weight for better readability */
    margin-right: 0.5rem; /* Spacing between label and dropdown */
    border-color: black;
}

  .article-grid {
    /* display: grid;
    grid-template-columns: repeat(3, 1fr); */
    columns: 300px;
    gap: 1rem;
    width: 100%;
  }

  .no-articles {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 300px;
    font-size: 1.2rem;
    color: white;
  }

  .article-link {
    transition: transform 0.2s;
    color: #fff;
    text-decoration: none;
    display: inline-block;
  }

  .article-link:hover {
    transform: translateY(-5px);
  }
</style>
