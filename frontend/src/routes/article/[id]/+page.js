export async function load({ fetch, params }) {
    // Fetch the article data using the provided ID
    const response = await fetch(`http://localhost:3000/api/articles/${params.id}`);
    console.log("Article Id:",params.id);
    const article = await response.json();

    const response2 = await fetch(`http://localhost:3000/api/users/${article.author_id}`);
    const author = await response2.json();
    
    return {
        article, author
    };
  }