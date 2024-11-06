package pccit.finalproject.javaclient;

import com.fasterxml.jackson.databind.ObjectMapper;

import javax.imageio.ImageIO;
import javax.swing.*;
import java.awt.Image;
import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.List;

public class API {

    private static final String BASE_URL = "http://localhost:3000/api";  // Backend base URL
    private static final ObjectMapper objectMapper = new ObjectMapper();
    private String sessionCookie = null;

    // Perform login
    public boolean login(String username, String password) {
        try {
            URL url = new URL(BASE_URL + "/login");
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setDoOutput(true);
            conn.setRequestProperty("Content-Type", "application/json");

            String payload = String.format("{\"username\":\"%s\",\"password\":\"%s\"}", username, password);
            conn.getOutputStream().write(payload.getBytes());

            int statusCode = conn.getResponseCode();
            if (statusCode == 200) {
                sessionCookie = conn.getHeaderField("Set-Cookie");
                return true;  // Return success message on successful login
            } else if (statusCode == 401) {
                return false;  // For invalid credentials or expired token
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
        return false;  // Return false if something else goes wrong
    }

    // Perform logout
    public void logout() {
        try {
            URL url = new URL(BASE_URL + "/logout");
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("DELETE");
            if (sessionCookie != null) {
                conn.setRequestProperty("Cookie", sessionCookie);
            }
            conn.getResponseCode();
            sessionCookie = null;
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    // Fetch users by sending a GET request to /users
    public List<User> getUsers() throws IOException {
        URL url = new URL(BASE_URL + "/users");
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("GET");
        if (sessionCookie != null) {
            conn.setRequestProperty("Cookie", sessionCookie);  // Send the session cookie
        }

        int statusCode = conn.getResponseCode();

        if (statusCode == 403) {
            throw new IOException("Unauthenticated user");  // Handle 403 error specifically
        } else if (statusCode == 200) {
            InputStream inputStream = conn.getInputStream();
            return objectMapper.readValue(inputStream, objectMapper.getTypeFactory().constructCollectionType(List.class, User.class));
        } else {
            throw new IOException("Failed to fetch users: HTTP " + statusCode);
        }
    }

    // Delete a user by sending a DELETE request to /users/:id
    public boolean deleteUser(int userId) {
        try {
            URL url = new URL(BASE_URL + "/users/" + userId);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("DELETE");
            if (sessionCookie != null) {
                conn.setRequestProperty("Cookie", sessionCookie);  // Send the session cookie
            }

            if (conn.getResponseCode() == 204) {  // 204 means successful deletion with no content response
                return true;
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
        return false;
    }

    // Fetch and return a user's profile image by sending a GET request to /users/:id/profile-image
    public ImageIcon getUserProfileImage(String avatar) {
        try {
            // Assuming 'avatar' contains the path like "/images/avatars/avatar.png"
            String imageUrl = "http://localhost:3000" + avatar;  // Prepend the base URL to construct the full URL
            URL url = new URL(imageUrl);

            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            if (sessionCookie != null) {
                conn.setRequestProperty("Cookie", sessionCookie);  // Include the session cookie if available
            }

            // Read the image from the input stream
            InputStream inputStream = conn.getInputStream();
            Image image = ImageIO.read(inputStream);
            return new ImageIcon(image);  // Return the ImageIcon to be used in the UI
        } catch (IOException e) {
            e.printStackTrace();
        }
        return null;
    }
}
