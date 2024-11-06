<script>
  import { onMount } from "svelte";
  import { COMMENT_URL } from "$lib/js/api-urls";
  import dayjs from "dayjs"; // Import dayjs to format date and time
  import relativeTime from "dayjs/plugin/relativeTime";
  dayjs.extend(relativeTime);

  export let articleId;
  export let userId;
  let comments = [];
  let newComment = "";
  let replyCommentId = null; // ID of the comment being replied to
  let newReply = ""; // New reply text
  let errorMessage = ""; // Variable for error messages
  let allCommentsHidden = false; // State to manage global visibility

  // Debug: Check the value of articleId
  $: console.log("Article ID:", articleId);

  // Function to fetch comments
  async function fetchComments() {
    if (!articleId) return;

    try {
      const response = await fetch(`http://localhost:3000/api/articles/${articleId}/comments`, {
        credentials: "include"
      });
      if (response.ok) {
        const data = await response.json();
        comments = data.comments.map((comment) => ({
          ...comment,
          hidden: allCommentsHidden,
          created_at: comment.date ? dayjs(comment.date).format("YYYY-MM-DD HH:mm:ss") : "Unknown",
          relative_time: comment.date ? dayjs(comment.date).fromNow() : "Unknown"
        }));
      } else {
        console.error("Failed to fetch comments:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  }

  // Function to toggle visibility of all comments
  function toggleAllCommentsVisibility() {
    allCommentsHidden = !allCommentsHidden;
    comments = comments.map((comment) => ({ ...comment, hidden: allCommentsHidden }));
  }

  // Function to get the current date and time
  function getCurrentDateTime() {
    return dayjs().format("YYYY-MM-DD HH:mm:ss");
  }

  // Function to add a new comment
  async function addComment() {
    if (!newComment.trim() || !articleId) return;

    try {
      const payload = {
        content: newComment,
        article_id: articleId,
        created_at: getCurrentDateTime() // Add creation time
      };

      const response = await fetch(`${COMMENT_URL}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        fetchComments();
        newComment = "";
        errorMessage = ""; // Reset error message if successful
      } else {
        const errorData = await response.json();
        errorMessage = errorData.message || "Failed to add comment"; // Set error message
      }
    } catch (error) {
      errorMessage = "Failed to add comment"; // Set error message if an error occurs
    }
  }

  // Function to add a reply
  async function addReply(parentCommentId) {
    if (!newReply.trim() || !articleId) return;

    const parentComment = comments.find((comment) => comment.comment_id === parentCommentId);
    const parentDepth = parentComment ? parentComment.depth : 0;

    // Limit maximum reply depth to 3
    if (parentDepth >= 2) {
      errorMessage = "Maximum depth of replies is 3.";
      return;
    }

    try {
      const payload = {
        content: newReply,
        article_id: articleId,
        parent_comment_id: parentCommentId, // ID of the parent comment
        created_at: getCurrentDateTime() // Add creation time
      };

      const response = await fetch(`${COMMENT_URL}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        fetchComments();
        newReply = "";
        replyCommentId = null; // Reset ID of the comment being replied to
        errorMessage = ""; // Reset error message if successful
      } else {
        const errorData = await response.json();
        errorMessage = errorData.message || "Failed to add reply"; // Set error message
      }
    } catch (error) {
      errorMessage = "Failed to add reply"; // Set error message if an error occurs
    }
  }

  // Function to delete a comment and its children
  async function deleteComment(commentId) {
    try {
      const response = await fetch(`${COMMENT_URL}/${commentId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ userId }) // Pass userId to the backend
      });

      if (response.ok) {
        fetchComments(); // Refresh comments after deletion
        errorMessage = ""; // Reset error message if successful
      } else {
        const errorData = await response.json();
        errorMessage = errorData.message || "Failed to delete comment"; // Set error message
      }
    } catch (error) {
      errorMessage = "Failed to delete comment"; // Set error message if an error occurs
    }
  }

  // Function to group comments by parent_comment_id
  function groupComments(comments, parentId = null, depth = 0) {
    return comments
      .filter((comment) => comment.parent_comment_id === parentId)
      .map((comment) => ({ ...comment, depth }))
      .map((comment) => ({
        ...comment,
        children: groupComments(comments, comment.comment_id, comment.depth + 1)
      }));
  }

  onMount(fetchComments); // Fetch comments when the component mounts

  $: if (articleId) {
    console.log("Article ID changed, fetching comments...");
    fetchComments();
  }
</script>

<div class="comment-section">
  <h3>Comments</h3>

  <!-- Global Hide/Unhide button -->
  <button class="toggle-all-button" on:click={toggleAllCommentsVisibility}>
    {allCommentsHidden ? "Unhide All Comments ▼" : "Hide All Comments ▲"}
  </button>

  <br />

  <!-- Display error message if present -->
  {#if errorMessage}
    <span class="error-message">{errorMessage}</span>
  {/if}

  <!-- Recursive function to display comments up to 3 levels -->
  {#each groupComments(comments) as comment (comment.comment_id)}
    <div class="comment-container" style="margin-left: {Math.min(comment.depth, 2) * 20}px;">
      <!-- Display comment content if not hidden -->
      {#if !comment.hidden}
        <div class="comment-header">
          <img src={`http://localhost:3000${comment.avatar}`} alt="avatar" class="comment-avatar" />

          <div class="comment-details">
            <div class="comment-info">
              <strong class="comment-username">{comment.username}</strong>
              <p class="comment-date">
                Posted on: {comment.created_at}
                <span class="relative-time">({comment.relative_time})</span>
              </p>
            </div>

            <p class="comment-content">{comment.content}</p>

            <div class="comment-actions">
              {#if comment.user_id === userId}
                <button class="delete-button" on:click={() => deleteComment(comment.comment_id)}>
                  Delete
                </button>
              {/if}
              {#if comment.depth < 2}
                <button class="reply-button" on:click={() => (replyCommentId = comment.comment_id)}>
                  Reply
                </button>
              {/if}
            </div>
          </div>
        </div>

        <!-- Form to add a reply -->
        {#if replyCommentId === comment.comment_id}
          <div class="reply-form">
            <textarea bind:value={newReply} placeholder="Write a reply..." rows="2"></textarea>
            <button
              class="reply-button"
              on:click={() => addReply(comment.comment_id)}
              disabled={!newReply.trim()}
            >
              Submit Reply
            </button>
          </div>
        {/if}

        <!-- Display child comments recursively -->
        {#each comment.children as child}
          <div class="comment-container" style="margin-left: {Math.min(child.depth, 2) * 20}px;">
            <!-- Display child comment content if not hidden -->
            {#if !child.hidden}
              <div class="comment-header">
                <img
                  src={`http://localhost:3000${child.avatar}`}
                  alt="avatar"
                  class="comment-avatar"
                />

                <div class="comment-details">
                  <div class="comment-info">
                    <strong class="comment-username">{child.username}</strong>
                    <p class="comment-date">
                      Posted on: {child.created_at}
                      <span class="relative-time">({comment.relative_time})</span>
                    </p>
                  </div>

                  <p class="comment-content">{child.content}</p>

                  <div class="comment-actions">
                    {#if child.user_id === userId}
                      <button
                        class="delete-button"
                        on:click={() => deleteComment(child.comment_id)}
                      >
                        Delete
                      </button>
                    {/if}
                    {#if child.depth < 2}
                      <button
                        class="reply-button"
                        on:click={() => (replyCommentId = child.comment_id)}
                      >
                        Reply
                      </button>
                    {/if}
                  </div>
                </div>
              </div>

              <!-- Form to add a reply -->
              {#if replyCommentId === child.comment_id}
                <div class="reply-form">
                  <textarea bind:value={newReply} placeholder="Write a reply..." rows="2"
                  ></textarea>
                  <button
                    class="reply-button"
                    on:click={() => addReply(child.comment_id)}
                    disabled={!newReply.trim()}
                  >
                    Submit Reply
                  </button>
                </div>
              {/if}

              <!-- Display grandchild comments recursively -->
              {#each child.children as grandchild}
                <div
                  class="comment-container"
                  style="margin-left: {Math.min(grandchild.depth, 2) * 20}px;"
                >
                  <!-- Display grandchild comment content if not hidden -->
                  {#if !grandchild.hidden}
                    <div class="comment-header">
                      <img
                        src={`http://localhost:3000${grandchild.avatar}`}
                        alt="avatar"
                        class="comment-avatar"
                      />

                      <div class="comment-details">
                        <div class="comment-info">
                          <strong class="comment-username">{grandchild.username}</strong>
                          <p class="comment-date">
                            Posted on: {grandchild.created_at}
                            <span class="relative-time">({comment.relative_time})</span>
                          </p>
                        </div>

                        <p class="comment-content">{grandchild.content}</p>

                        <div class="comment-actions">
                          {#if grandchild.user_id === userId}
                            <button
                              class="delete-button"
                              on:click={() => deleteComment(grandchild.comment_id)}
                            >
                              Delete
                            </button>
                          {/if}
                          {#if grandchild.depth < 2}
                            <button
                              class="reply-button"
                              on:click={() => (replyCommentId = grandchild.comment_id)}
                            >
                              Reply
                            </button>
                          {/if}
                        </div>
                      </div>
                    </div>

                    <!-- Form to add a reply -->
                    {#if replyCommentId === grandchild.comment_id}
                      <div class="reply-form">
                        <textarea bind:value={newReply} placeholder="Write a reply..." rows="2"
                        ></textarea>
                        <button
                          class="reply-button"
                          on:click={() => addReply(grandchild.comment_id)}
                          disabled={!newReply.trim()}
                        >
                          Submit Reply
                        </button>
                      </div>
                    {/if}
                  {/if}
                </div>
              {/each}
            {/if}
          </div>
        {/each}
      {/if}
    </div>
  {/each}

  <!-- Input to add a new comment -->
  <textarea bind:value={newComment} placeholder="Add a comment..." rows="3"></textarea>
  <button class="submit-button" on:click={addComment} disabled={!newComment.trim()}>Submit</button>
</div>

<style>
  .comment-section {
    margin-top: 20px;
    padding: 20px;
    background-color: #2c2c2c;
    border-radius: 5px;
    color: #f1f1f1;
    width: 90em;
    max-width: 100%;
    margin-left: auto;
    margin-right: auto;
    box-sizing: border-box;
  }

  .toggle-all-button {
    margin-bottom: 10px;
    padding: 8px 12px;
    background-color: #888;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }

  .comment-container {
    display: flex;
    flex-direction: column;
    margin-bottom: 10px;
    padding: 10px;
    background-color: #444;
    border-radius: 5px;
    color: #f1f1f1;
    gap: 5px;
  }

  .comment-header {
    display: flex;
    align-items: flex-start;
    gap: 10px;
  }

  .comment-avatar {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    object-fit: cover;
    padding: 10px;
  }

  .comment-details {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .comment-info {
    display: flex;
    align-items: center;
    justify-content: flex-start;
  }

  .comment-username {
    font-weight: bold;
    color: #ffb400;
  }

  .comment-date {
    font-size: 1em;
    color: #aaa;
    padding: 10px;
  }

  .comment-content {
    margin-top: 5px;
  }

  .comment-actions {
    display: flex;
    gap: 5px;
    margin-top: 5px;
  }

  .delete-button,
  .reply-button {
    padding: 6px 10px;
    background-color: #3498db;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }

  .delete-button {
    background-color: #d63031;
  }

  .reply-form {
    margin-top: 10px;
  }

  .reply-form textarea,
  textarea {
    width: 100%;
    margin-top: 5px;
    padding: 5px;
    border-radius: 5px;
    border: 1px solid #555;
    background-color: #3c3c3c;
    color: #f1f1f1;
    resize: vertical;
    box-sizing: border-box;
  }

  .submit-button {
    margin-top: 8px;
    padding: 8px 12px;
    background-color: #3498db;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    display: block;
  }

  .error-message {
    color: #ff4c4c;
    font-weight: bold;
    margin-bottom: 10px;
    display: block;
  }

  .relative-time {
    font-size: 0.9em;
    color: #888;
  }
</style>
