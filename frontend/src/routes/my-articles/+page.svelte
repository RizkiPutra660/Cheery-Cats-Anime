<script>
    import { onMount } from "svelte";
    import { USER_URL, ARTICLE_URL } from "$lib/js/api-urls.js";
    import Article from "$lib/components/ArticleSummary.svelte";
    import "$lib/css/app.css";

    let articles = [];

    async function fetchArticles() {
        const url = `${ARTICLE_URL}/user/${user.id}`;
        const response = await fetch(url);
        const data = await response.json();
        articles = data;
    }

    export let data;
    const { user, isLoggedIn } = data;

    onMount(fetchArticles);
</script>

<!-- User's Articles -->
{#if isLoggedIn}
<section class="user-articles">
    <h1 class="title">Articles by {user.fname} {user.lname}</h1>
    {#if articles.length > 0}
        <div class="article-grid">
            {#each articles as article}
                <a href={`/article/${article.article_id}`} class="article-link"><Article {article} /></a>
            {/each}
        </div>
    {:else}
        <div class="no-articles">
            <p>No articles posted by this user.</p>
        </div>
    {/if}
</section>
{/if}

<style>
    /* Styling for the article page */
    .user-articles {
        background-image: url("dark-anime4.png");
        min-height: 100vh;
        padding: 2rem 5%;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        color: #fff;
    }

    .title {
        font-family: "Bangers", system-ui;
        letter-spacing: 0.1em;
        color: white;
        font-size: 3rem;
        font-weight: normal;
        margin-bottom: 1.5rem;
        text-align: center;
    }
    
   .article-grid {
        columns: 4 300px; 
        gap: 1em;
        
    }

    .article-link {
        padding: 1rem;
        transition: transform 0.2s;
        color: #fff;
        text-decoration: none;
        display: inline-block;
    }

    .article-link:hover {
        transform: translateY(-5px);
    }

    .no-articles {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 300px; /* Consistent height to prevent layout shift */
        font-size: 1.2rem;
        color: #888;
        text-align: center;
    }
</style>
