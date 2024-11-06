<script>
  import { onMount, onDestroy } from "svelte";
  import tinymce from "tinymce/tinymce";
  import "tinymce/themes/silver/theme";
  import "tinymce/icons/default";
  import "tinymce/models/dom";
  import "tinymce/plugins/autoresize";
  import "tinymce/plugins/link";
  import "tinymce/plugins/image";
  import "tinymce/plugins/lists";
  import "tinymce/plugins/advlist";
  import "$lib/css/app.css";
  import { goto } from "$app/navigation";
  import { BASE_URL } from "$lib/js/api-urls.js";

  let articleTitle = "";
  let articleSummary = "";
  let articleContent = ""; // This will be updated by TinyMCE
  let imageFile = null;
  let message = false;

  function handleClick() {
    message = true;
    setTimeout(() => {
      message = false;
      goto("/my-articles");
    }, 2000);
  }

  onMount(() => {
    if (typeof window !== "undefined") {
      tinymce.init({
        selector: "#mytextarea",
        height: 500,
        plugins: "autoresize link image lists advlist",
        toolbar: "undo redo | h1 h2 h3 h4 | bold italic bullist | link",
        license_key: "gpl",
        advlist_bullet_styles: "circle",
        skin: false,
        content_css: false,
        menubar: false,
        setup: (editor) => {
          editor.on("change", () => {
            articleContent = editor.getContent();
          });
        }
      });
    }
  });

  onDestroy(() => {
    if (typeof window !== "undefined") {
      tinymce.remove("#mytextarea");
    }
  });

  function handleFileChange(event) {
    if (event.target.files && event.target.files.length > 0) {
      imageFile = event.target.files[0];
    } else {
      console.log("No file selected");
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData();
    formData.append("title", articleTitle);
    formData.append("summary", articleSummary);
    formData.append("content", articleContent);
    if (imageFile) {
      formData.append("imageFile", imageFile);
    }

    try {
      const response = await fetch(`${BASE_URL}/articles`, {
        method: "POST",
        credentials: "include",
        body: formData
      });

      if (!response.ok) {
        throw new Error("Failed to create article");
      }

      const result = await response.json();
      handleClick();
      console.log("Article created successfully:", result);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  }
</script>

<div class="body">
  <div id="article-container">
    <h1>Create Your Article</h1>
    <form class="create-article-form" enctype="multipart/form-data" on:submit={handleSubmit}>
      <label for="title">Article Title:</label>
      <input type="text" id="title" name="title" bind:value={articleTitle} required />

      <label for="summary">Article Summary:</label>
      <input type="text" id="summary" name="summary" bind:value={articleSummary} required />

      <label for="content">Article Content:</label>
      <textarea id="mytextarea" name="content" bind:value={articleContent}></textarea>

      <label for="imageFile">Upload image</label>
      <input
        type="file"
        id="imageFile"
        name="imageFile"
        accept=".jpg, .png, .jpeg, .gif, .bmp"
        on:change={handleFileChange}
      />

      <button id="create-article" type="submit">Submit</button>
    </form>

    {#if message}
      <div class="message-box">✨ Your Article Has Been Created Successfully! 🎉</div>
    {/if}
  </div>
</div>

<style>
  @import "https://cdn.jsdelivr.net/npm/tinymce@5/skins/ui/oxide/skin.min.css";
  @import "https://cdn.jsdelivr.net/npm/tinymce@5/skins/content/default/content.css";

  .body {
    background-image: url("dark-anime5.jpeg"); /* Replace with your image path */
    background-size: cover;
    background-position: center;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }

  #article-container {
    background: rgba(255, 255, 255, 0.9); /* Slightly transparent background for readability */
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
    padding: 20px 40px;
    width: 80%;
    max-width: 1000px;
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

  .create-article-form {
    display: flex;
    flex-direction: column;
  }

  .create-article-form input[type="text"] {
    animation: fadeIn 0.8s ease;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .message-box {
    position: fixed;
    top: 20%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #1e90ff;
    color: #ffffff;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
    font-size: 20px;
    text-align: center;
    z-index: 1000;
    opacity: 0;
    animation: fadeInOut 4s forwards;
  }

  @keyframes fadeInOut {
    0% {
      opacity: 0;
      transform: translate(-50%, -60%);
    }
    20% {
      opacity: 1;
      transform: translate(-50%, -50%);
    }
    85% {
      opacity: 1;
      transform: translate(-50%, -50%);
    }
    100% {
      opacity: 0;
      transform: translate(-50%, -40%);
    }
  }
</style>
