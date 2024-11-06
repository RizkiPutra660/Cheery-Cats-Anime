<script>
  export let article;
</script>

<div class="wrapper rgb">
  <article class="article">
    <img src={`http://localhost:3000${article.image}`} alt={article.title} class="article-image" />
    <div class="article-content">
      <h3>{article.title}</h3>
      <p>{article.summary}</p>
      <p><strong>{article.date}</strong></p>
    </div>
  </article>
</div>

<style>
  .article {
    background-color: #1e1e1e;
    padding: 0.5rem;
    border-radius: 10px;
    overflow: hidden;
    margin-bottom: 10px;
    box-shadow: 5px 5px 15px rgba(211, 211, 211, 0.173);
    z-index: 2;
    overflow: hidden;
    position: relative;
  }

  .wrapper {
    z-index: 0;
    position: relative;
  }

  .article-image {
    width: 100%;
    height: 200px;
    object-fit: cover;
    z-index: 2;
    position: relative;
  }

  .article-content {
    margin-top: 1rem;
    z-index: 2;
    position: relative;
    text-align: center;
    padding-left: 20px;
    padding-right: 20px;
  }

  .rgb::after {
    content: "";
    background: linear-gradient(
        45deg,
        red 0%,
        orange 10%,
        yellow 20%,
        green 30%,
        blue 50%,
        indigo 70%,
        violet 90%,
        red 100%
      )
      repeat 0% 0% / 300% 100%;
    position: absolute;
    inset: -3px;
    border-radius: 16px;
    filter: blur(8px);
    z-index: 0;
    animation: rgb 6s linear infinite;
  }

  @keyframes rgb {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }
</style>
