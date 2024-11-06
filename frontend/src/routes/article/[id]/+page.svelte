<script>
  import CommentSection from "$lib/components/CommentSection.svelte";
  import LikeButton from "$lib/components/LikeButton.svelte";
  import DeleteArticle from "$lib/components/DeleteArticle.svelte"; // Import the DeleteArticle component
  import { ARTICLE_URL } from "$lib/js/api-urls.js";
  import { goto } from "$app/navigation"; // For redirection after deletion
  import "$lib/css/app.css";

  export let data; // 'data' contains the article fetched from +page.js
  let { article, author } = data; // Extract the article from the data
  let userId = data.userId;
  let articleId = article.article_id;
  $: isAuthor = article && data.user?.id === article.author_id;

  let hasNextArticle = true;
  let hasPreviousArticle = true;

  // Dropdown visibility
  let dropdownVisible = false;
  let showDeleteModal = false; // State to control the visibility of the DeleteArticle modal

  function toggleDropdown() {
    dropdownVisible = !dropdownVisible;

    // Add an event listener to detect clicks outside the dropdown
    if (dropdownVisible) {
      document.addEventListener("click", handleOutsideClick);
    }
  }

  function handleOutsideClick(event) {
    const dropdown = document.querySelector(".dropdown-menu");
    const menuButton = document.querySelector(".menu-button");

    if (dropdown && !dropdown.contains(event.target) && !menuButton.contains(event.target)) {
      dropdownVisible = false;
      document.removeEventListener("click", handleOutsideClick);
    }
  }

  function handleEdit() {
    window.location.href = `/article/${articleId}/edit`;
  }

  function handleDelete() {
    showDeleteModal = true; // Show the modal instead of confirming directly
  }

  async function confirmDelete() {
    const deleteResponse = await fetch(`${ARTICLE_URL}/${articleId}`, {
      method: "DELETE",
      credentials: "include"
    });

    if (deleteResponse.ok) {
      console.log("Article deleted successfully");

      // Close confirmation
      showDeleteModal = false;

      goto("/my-articles");
    } else {
      console.error("Failed to delete article");
    }
  }

  function cancelDelete() {
    showDeleteModal = false; // Close the modal without deleting
  }

  async function loadNextArticle() {
    const fetchUrl = `${ARTICLE_URL}/next/${articleId}`;
    try {
      const response = await fetch(fetchUrl);
      if (response.ok) {
        const nextArticleData = await response.json();

        // Update article and related info
        article = nextArticleData;
        articleId = nextArticleData.article_id;
        author = { username: nextArticleData.username, avatar: nextArticleData.avatar };
        article.date = nextArticleData.date; // Update publication date
        goto(`/article/${articleId}`, { replaceState: true });
      } else if (response.status === 404) {
        hasNextArticle = false;
      } else {
        console.error("Failed to load next article:", response.status, response.statusText);
      }
    } catch (error) {
      console.error("Error fetching next article:", error);
    }
  }

  async function loadPreviousArticle() {
    const fetchUrl = `${ARTICLE_URL}/previous/${articleId}`;
    try {
      const response = await fetch(fetchUrl);
      if (response.ok) {
        const previousArticleData = await response.json();

        article = previousArticleData;
        articleId = previousArticleData.article_id;
        author = { username: previousArticleData.username, avatar: previousArticleData.avatar };
        article.date = previousArticleData.date; // Update publication date

        goto(`/article/${articleId}`, { replaceState: true });

        hasNextArticle = true;
      } else if (response.status === 404) {
        hasPreviousArticle = false;
      } else {
        console.error("Failed to load previous article:", response.status, response.statusText);
      }
    } catch (error) {
      console.error("Error fetching previous article:", error);
    }
  }
</script>

<!-- Article Display -->
{#if article}
  <!-- Check if article exists -->
  <article>
    <div class="article-header">
      <h1 class="article-title">{article.title}</h1>
      {#if isAuthor}
        <div class="dropdown">
          <button class="menu-button" on:click={toggleDropdown}>⋮</button>
          {#if dropdownVisible}
            <div class="dropdown-menu">
              <button on:click={handleEdit} class="dropdown-item">Edit</button>
              <button on:click={handleDelete} class="dropdown-item">Delete</button>
            </div>
          {/if}
        </div>
      {/if}
    </div>

    {#if article.image}
      <img
        src={`http://localhost:3000${article.image}`}
        alt={article.title}
        class="article-image"
      />
    {/if}
    <div class="article-sub">
      <p class="article-author">By {author.username}</p>
      <p class="article-date">Date: {new Date(article.date).toLocaleDateString()}</p>
    </div>

    <div class="article-content">
      <p>{@html article.content}</p>
    </div>

    <!-- Like Button Section -->
    <LikeButton {articleId} />
    <!-- Comment Section -->
    <CommentSection articleId={article.article_id} {userId} />

    <div class="navigation-buttons">
      {#if article.article_id === 1}
        <button class="previous-article-button" on:click={loadPreviousArticle} disabled> ◄ </button>
      {:else}
        <button class="previous-article-button" on:click={loadPreviousArticle}> ◄ </button>
      {/if}

      {#if !hasNextArticle}
        <button class="next-article-button" on:click={loadNextArticle} disabled> ► </button>
      {:else}
        <button class="previous-article-button" on:click={loadNextArticle}> ► </button>
      {/if}
    </div>
  </article>

  <!-- Delete Article Modal -->
  <DeleteArticle visible={showDeleteModal} onConfirm={confirmDelete} onCancel={cancelDelete} />
{:else}
  <p>Loading article...</p>
{/if}

<style>
  /* Container for the article page */
  article {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px;
    background-color: #f4f4f4;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    max-width: 800px;
    margin: 20px auto;
    position: relative; /* Make the article position relative for dropdown */
  }

  /* Article header styling */
  .article-header {
    display: flex;
    justify-content: space-between; /* Space between title and dropdown */
    align-items: center; /* Center the title and dropdown vertically */
    width: 100%;
  }

  /* Article title */
  .article-title {
    font-size: 2.5rem;
    margin: 0; /* Set margin to 0 to avoid misalignment */
    color: #333;
    text-align: center; /* Center the text */
    flex: 1; /* Allow it to take up available space in the flex container */
    margin-top: 15px;
  }

  /* Article image styling */
  .article-image {
    width: 100%;
    max-width: 600px;
    border-radius: 8px;
    margin-bottom: 20px;
    margin-top: 25px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  }

  /* Meta information styling */
  .article-sub {
    text-align: center;
    margin-bottom: 20px;
  }

  .article-author,
  .article-date {
    font-weight: bold;
    margin-bottom: 5px;
    color: #555;
  }

  /* Article content */
  .article-content {
    background-color: #fff;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    line-height: 1.6;
    color: #333;
    text-align: justify;
  }

  /* Dropdown styling */
  .dropdown {
    position: relative;
    margin-left: 10px; /* Add some space between title and menu */
  }

  .menu-button {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 24px;
    padding: 0; /* Remove padding */
  }

  .dropdown-menu {
    position: absolute;
    top: 100%; /* Position below the button */
    right: 0; /* Align to the right */
    background-color: white;
    border: 1px solid #ddd;
    border-radius: 5px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    z-index: 1000;
  }

  .dropdown-item {
    padding: 10px 20px;
    border: none;
    background: none;
    text-align: left;
    width: 100%;
    cursor: pointer;
    font-family: sans-serif;
  }

  .dropdown-item:hover {
    background-color: #8ebdef;
  }

  /* Responsive design for smaller screens */
  @media (max-width: 768px) {
    .article-title {
      font-size: 2rem;
    }

    .article-image {
      width: 100%;
    }
  }

  .article-content {
    margin-top: 1rem;
  }

  img {
    max-width: 100%;
    height: auto;
    display: block;
    margin-bottom: 1rem;
  }

  .next-article-button:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }

  .navigation-buttons {
    display: flex;
    justify-content: space-between;
    width: 100%;
    margin-top: 20px;
  }

  .previous-article-button,
  .next-article-button {
    padding: 10px 20px;
    font-size: 1rem;
    color: #fff;
    background-color: #228b22;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }

  .previous-article-button:disabled,
  .next-article-button:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
</style>
