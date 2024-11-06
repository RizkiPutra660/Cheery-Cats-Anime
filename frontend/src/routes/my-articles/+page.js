export async function load({ fetch }) {
    try {
        // Fetch logged-in user information
        const userResponse = await fetch('http://localhost:3000/api/users/me', { credentials: 'include' });
        if (!userResponse.ok) {
            throw new Error('Failed to fetch user information');
        }

        const user = await userResponse.json();

        // Fetch articles by the logged-in user's ID
        const articlesResponse = await fetch(`http://localhost:3000/api/users/${user.id}`);
        if (!articlesResponse.ok) {
            throw new Error(`Failed to fetch articles for user with ID ${user.id}`);
        }

        const articles = await articlesResponse.json();

        // Return the fetched user data and articles
        return {
            user,
            articles
        };
    } catch (error) {
        // Log the error for debugging purposes
        console.error('Error loading user data or articles:', error);

        // Return an error object and status code to the page
        return {
            status: error.status || 500,
            error: new Error(error.message || 'An error occurred while loading data')
        };
    }
}