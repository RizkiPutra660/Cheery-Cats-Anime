<script>
  import { onMount } from "svelte";

  export let articleId;
  let likeCount = 0;
  let userLiked = false;
  let isAuthenticated = false;
  let errorMessage = "";
  let animateLikeCount = false;

  async function checkAuth() {
    try {
      const response = await fetch("http://localhost:3000/api/users/me", {
        credentials: "include"
      });
      isAuthenticated = response.ok;
      isAuthenticated ? await fetchAuthLikes() : await fetchPublicLikes();
    } catch (error) {
      errorMessage = "Failed to check authentication.";
      await fetchPublicLikes();
    }
  }

  async function fetchAuthLikes() {
    if (!articleId) return;

    try {
      const response = await fetch(`http://localhost:3000/api/articles/${articleId}/likes/auth`, {
        credentials: "include"
      });
      if (response.ok) {
        const data = await response.json();
        likeCount = data.likeCount ?? 0;
        userLiked = data.userLiked ?? false;
      } else {
        errorMessage = "Failed to fetch authenticated like data.";
      }
    } catch (error) {
      errorMessage = "Error fetching authenticated like data.";
    }
  }

  async function fetchPublicLikes() {
    if (!articleId) return;

    try {
      const response = await fetch(`http://localhost:3000/api/articles/${articleId}/likes/public`);
      if (response.ok) {
        const data = await response.json();
        likeCount = data.likeCount ?? 0;
      } else {
        errorMessage = "Failed to fetch public like data.";
      }
    } catch (error) {
      errorMessage = "Error fetching public like data.";
    }
  }

  async function toggleLike() {
    if (!isAuthenticated) {
      errorMessage = "Please log in to like this article.";
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/articles/${articleId}/toggle-like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include"
      });

      if (response.ok) {
        userLiked = !userLiked;
        animateLikeCount = true;
        likeCount += userLiked ? 1 : -1;
        errorMessage = "";

        setTimeout(() => {
          animateLikeCount = false;
        }, 500);
      } else {
        const errorData = await response.json();
        errorMessage = errorData.message || "Failed to toggle like.";
      }
    } catch (error) {
      errorMessage = "Failed to toggle like.";
    }
  }

  $: if (articleId) {
    console.log("Article ID changed, fetching like status...");
    checkAuth();
  }

  onMount(async () => {
    await checkAuth();
  });
</script>

<div class="like-button">
  <div class="error-container">
    {#if errorMessage}
      <span class="error-message">{errorMessage}</span>
    {/if}
  </div>

  <div class="heart-container">
    <button
      on:click={toggleLike}
      class="heart-icon"
      class:user-liked={userLiked}
      disabled={!articleId}
    >
      {userLiked ? "❤️" : "🤍"}
    </button>
    <span class="like-count {animateLikeCount ? 'animating' : ''}">{likeCount}</span>
  </div>
</div>

<style>
  .heart-container {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .heart-icon {
    font-size: 2rem;
    padding: 0;
    margin: 0;
    border: none;
    background: none;
    cursor: pointer;
    transition:
      transform 0.3s,
      color 0.3s;
  }

  .heart-icon:hover {
    transform: scale(1.1);
  }

  .heart-icon:disabled {
    color: rgb(136, 66, 66);
    cursor: not-allowed;
  }

  .like-count {
    font-size: 2rem;
    color: #030303;
    transition:
      transform 0.5s,
      step-end linear;
  }

  .like-count.animating {
    transform: scale(1.3);
  }

  .error-message {
    color: #ff4c4c;
    font-weight: bold;
    margin-top: 10px;
    display: block;
  }

  .like-button {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .error-container {
    height: 30px; /* Reserve space for the error message */
    margin-bottom: 5px;
  }
</style>
