<script>
    export let visible = false;
    export let onConfirm;
    export let onCancel;
  
    function close() {
      visible = false;
      onCancel();
    }
  </script>
  
  {#if visible}
    <div class="modal-overlay">
      <div class="modal">
        <h2>Confirm Deletion</h2>
        <p>Are you sure you want to delete this article?</p>
        <div class="modal-buttons">
          <button on:click={onConfirm} class="confirm-button">Delete</button>
          <button on:click={close} class="cancel-button">Cancel</button>
        </div>
      </div>
    </div>
  {/if}
  
  <style>
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
  
    .modal {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      text-align: center;
      width: 300px;
      max-width: 90%; /* Ensures it doesn't overflow on smaller screens */
    }
  
    h2 {
      margin: 0 0 10px; /* Adjust margin for heading */
      color: #333; /* Set a contrasting color */
    }
  
    p {
      margin: 0 0 20px; /* Adjust margin for paragraph */
      color: #555; /* Set a contrasting color */
    }
  
    .modal-buttons {
      display: flex;
      justify-content: space-around;
      margin-top: 20px;
    }
  
    .confirm-button,
    .cancel-button {
      padding: 10px 15px;
      border: none;
      border-radius: 5px;
      cursor: pointer;
    }
  
    .confirm-button {
      background-color: #dc3545; /* Danger color */
      color: white;
    }
  
    .cancel-button {
      background-color: #007bff; /* Primary color */
      color: white;
    }
  
    .confirm-button:hover {
      background-color: #c82333; /* Darker red */
    }
  
    .cancel-button:hover {
      background-color: #0056b3; /* Darker blue */
    }
  </style>
  