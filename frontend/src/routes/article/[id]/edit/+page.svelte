<script>
  import { onMount } from "svelte";
  import { ARTICLE_URL } from "$lib/js/api-urls.js";
  import { page } from "$app/stores";
  import { goto, invalidate } from "$app/navigation";
  import "$lib/css/app.css";

  let articleId;
  let title = "";
  let summary = "";
  let content = "";
  let imageFile = null;

  $: articleId = $page.params.id;

  function initializeTinyMCE(content) {
    tinymce.init({
      selector: "#mytextarea",
      height: 300,
      plugins: "lists advlist autoresize link ",
      toolbar: "undo redo | bold italic underline | h1 h2 h3 | bullist numlist | link",
      menubar: false,
      setup: (editor) => {
        editor.on("init", () => {
          editor.setContent(content);
        });
        editor.on("change", () => {
          content = editor.getContent();
        });
      }
    });
  }

  onMount(async () => {
    if (articleId) {
      const response = await fetch(`${ARTICLE_URL}/${articleId}`);
      const article = await response.json();

      title = article.title;
      summary = article.summary;
      content = article.content;

      const script = document.createElement("script");
      script.src = "https://cdn.tiny.cloud/1/by13ljeozyeeguckovj2bx0i70m501dfauhvrcuvclflv1ry/tinymce/5/tinymce.min.js";
      script.referrerpolicy = "origin";
      script.onload = () => {
        initializeTinyMCE(content);
      };
      document.head.appendChild(script);
    }
  });

  function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
      imageFile = file;
    }
  }

  async function submitArticle() {
    content = tinymce.get("mytextarea").getContent();
    const formData = new FormData();
    formData.append("title", title);
    formData.append("summary", summary);
    formData.append("content", content);

    if (imageFile) {
      formData.append("imageFile", imageFile);
    }

    const response = await fetch(`${ARTICLE_URL}/${articleId}`, {
      method: "PATCH",
      credentials: "include",
      body: formData
    });

    if (response.ok) {
      await invalidate("/");
      goto("/");
    } else {
      console.error("Failed to update article");
    }
  }
</script>

<div class="body">
  <div id="article-container">
    <h1>Edit Your Article</h1>

    <center>
      <form on:submit|preventDefault={submitArticle} enctype="multipart/form-data">
        <label for="title">Article Title:</label>
        <input type="text" id="title" bind:value={title} required />

        <label for="summary">Article Summary:</label>
        <input type="text" id="summary" bind:value={summary} required />

        <label for="content">Article Content:</label>
        <textarea id="mytextarea" name="content" bind:value={content}></textarea>

        <label for="imageFile">Upload Image:</label>
        <input
          type="file"
          id="imageFile"
          name="imageFile"
          on:change={handleImageUpload}
          accept=".jpg, .png, .jpeg, .gif, .bmp"
        />

        <button type="submit" on:click={submitArticle}>Update Article</button>
      </form>
    </center>
  </div>
</div>

<style>
  .body {
    background-image: url("https://images6.alphacoders.com/135/thumb-1920-1351633.png"); /* Replace with your image path */
    background-size: cover;
    background-position: center;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }

  #article-container {
    background: rgba(255, 255, 255, 0.9);
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
    padding: 20px 40px;
    width: 80%;
    max-width: 800px;
    transition: transform 0.3s ease;
  }

  #article-container:hover {
    transform: translateY(-5px);
  }

  h1 {
    text-align: center;
    color: #333;
    margin-bottom: 20px;
    font-size: 24px;
  }

  label {
    display: block;
    margin: 10px 0 5px;
    font-weight: bold;
    color: #444;
  }

  input[type="text"],
  textarea {
    width: 100%;
    padding: 10px;
    margin-bottom: 15px;
    border-radius: 5px;
    border: 1px solid #ccc;
    box-sizing: border-box;
    transition: border-color 0.3s ease;
  }

  input[type="file"] {
    padding: 10px;
    border: none;
    background: #f0f0f0;
    border-radius: 5px;
    cursor: pointer;
  }

  button[type="submit"] {
    background-color: #007bff;
    color: #fff;
    border: none;
    padding: 12px 20px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 16px;
    margin-top: 10px;
    transition: background-color 0.3s ease;
  }

  button[type="submit"]:hover {
    background-color: #0056b3;
  }
</style>
