package pccit.finalproject.javaclient;

import javax.swing.*;
import javax.swing.table.TableModel;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.util.List;

public class AdminInterface extends JFrame {

    private JTextField usernameField;
    private JPasswordField passwordField;
    private JButton loginButton, logoutButton, deleteUserButton;
    private JTable usersTable;
    private UserTableAdapter userTableAdapter;
    private JPanel profilePanel;
    private JLabel profileImageLabel, usernameLabel, fullNameLabel, bioLabel;
    private API api;

    public AdminInterface() {
        api = new API();

        setTitle("Cheery Cats' Anime Admin Interface");
        setLayout(new BorderLayout());
        setSize(1000, 600);  // Increased the size to make room for the profile info
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);

        // Username and password input fields
        JPanel loginPanel = new JPanel(new GridLayout(3, 2));
        loginPanel.add(new JLabel("Username:"));
        usernameField = new JTextField();
        loginPanel.add(usernameField);

        loginPanel.add(new JLabel("Password:"));
        passwordField = new JPasswordField();
        loginPanel.add(passwordField);

        loginButton = new JButton("Login");
        logoutButton = new JButton("Logout");
        logoutButton.setEnabled(false);

        loginPanel.add(loginButton);
        loginPanel.add(logoutButton);
        add(loginPanel, BorderLayout.NORTH);

        // Users table
        userTableAdapter = new UserTableAdapter(List.of());  // Initialize with an empty list
        usersTable = new JTable(userTableAdapter);
        add(new JScrollPane(usersTable), BorderLayout.CENTER);

        // Profile panel for displaying user info
        profilePanel = new JPanel();
        profilePanel.setLayout(new BoxLayout(profilePanel, BoxLayout.Y_AXIS));

        // Initialize profile info labels with placeholders
        usernameLabel = new JLabel("Username: Name goes here");
        fullNameLabel = new JLabel("Full Name: Full name goes here");
        bioLabel = new JLabel("Bio: About user goes here");

        // Profile image label with fixed size
        profileImageLabel = new JLabel();
        profileImageLabel.setPreferredSize(new Dimension(512, 615));  // Fixed size 100x100
        profileImageLabel.setHorizontalAlignment(SwingConstants.CENTER);

        // Placeholder avatar image
        profileImageLabel.setIcon(new ImageIcon("http://localhost:3000/images/avatars/placeholder.png"));  // Update with actual path to placeholder image

        profilePanel.add(profileImageLabel);
        profilePanel.add(usernameLabel);
        profilePanel.add(fullNameLabel);
        profilePanel.add(bioLabel);

        add(profilePanel, BorderLayout.EAST);  // Add profile panel to the right side

        // Delete user button
        deleteUserButton = new JButton("Delete User");
        deleteUserButton.setEnabled(false);
        add(deleteUserButton, BorderLayout.SOUTH);

        // Event listeners
        loginButton.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                handleLogin();
            }
        });

        logoutButton.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                handleLogout();
            }
        });

        deleteUserButton.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                handleDeleteUser();
            }
        });

        usersTable.getSelectionModel().addListSelectionListener(e -> {
            if (!e.getValueIsAdjusting() && usersTable.getSelectedRow() != -1) {
                showUserProfile(usersTable.getSelectedRow());
                deleteUserButton.setEnabled(true);
            }
        });

        setVisible(true);
    }

    // Asynchronous login with SwingWorker
    private void handleLogin() {
        loginButton.setEnabled(false);
        new SwingWorker<Boolean, Void>() {
            @Override
            protected Boolean doInBackground() throws Exception {
                String username = usernameField.getText();
                String password = new String(passwordField.getPassword());
                return api.login(username, password);
            }

            @Override
            protected void done() {
                try {
                    boolean success = get();
                    if (success) {
                        fetchUsers();
                    } else {
                        JOptionPane.showMessageDialog(AdminInterface.this, "Login failed!");
                    }
                } catch (Exception e) {
                    JOptionPane.showMessageDialog(AdminInterface.this, "An error occurred: " + e.getMessage());
                } finally {
                    loginButton.setEnabled(true);
                }
            }
        }.execute();
    }

    // Asynchronous logout
    private void handleLogout() {
        new SwingWorker<Void, Void>() {
            @Override
            protected Void doInBackground() throws Exception {
                api.logout();
                return null;
            }

            @Override
            protected void done() {
                userTableAdapter.setUsers(List.of());  // Clear table
                loginButton.setEnabled(true);
                logoutButton.setEnabled(false);
                deleteUserButton.setEnabled(false);

                // Clear username and password fields after logout
                usernameField.setText("");
                passwordField.setText("");

                // Clear profile information after logout
                clearProfileInfo();

                JOptionPane.showMessageDialog(AdminInterface.this, "Logged out successfully.");
            }
        }.execute();
    }

    // Fetch users asynchronously
    private void fetchUsers() {
        new SwingWorker<List<User>, Void>() {
            @Override
            protected List<User> doInBackground() throws Exception {
                return api.getUsers();
            }

            @Override
            protected void done() {
                try {
                    List<User> users = get();
                    userTableAdapter.setUsers(users);
                    loginButton.setEnabled(false);
                    logoutButton.setEnabled(true);
                } catch (Exception e) {
                    JOptionPane.showMessageDialog(AdminInterface.this, "Failed to fetch users: " + e.getMessage());
                }
            }
        }.execute();
    }

    // Asynchronous delete user
    private void handleDeleteUser() {
        int selectedRow = usersTable.getSelectedRow();
        if (selectedRow != -1) {
            User user = userTableAdapter.getUserAt(selectedRow);
            new SwingWorker<Boolean, Void>() {
                @Override
                protected Boolean doInBackground() throws Exception {
                    return api.deleteUser(user.getId());
                }

                @Override
                protected void done() {
                    try {
                        boolean success = get();
                        if (success) {
                            userTableAdapter.removeUser(selectedRow);  // Remove user from table
                            JOptionPane.showMessageDialog(AdminInterface.this, "User deleted.");
                        } else {
                            JOptionPane.showMessageDialog(AdminInterface.this, "Failed to delete user.");
                        }
                    } catch (Exception e) {
                        JOptionPane.showMessageDialog(AdminInterface.this, "Error deleting user: " + e.getMessage());
                    }
                }
            }.execute();
        }
    }

    // Show selected user profile asynchronously
    private void showUserProfile(int rowIndex) {
        User user = userTableAdapter.getUserAt(rowIndex);
        new SwingWorker<ImageIcon, Void>() {
            @Override
            protected ImageIcon doInBackground() throws Exception {
                ImageIcon originalIcon = api.getUserProfileImage(user.getAvatar());

                // Scale image to fit within 100x100 pixels while maintaining aspect ratio
                Image scaledImage = originalIcon.getImage().getScaledInstance(
                        profileImageLabel.getPreferredSize().width,
                        profileImageLabel.getPreferredSize().height,
                        Image.SCALE_SMOOTH
                );
                return new ImageIcon(scaledImage);
            }

            @Override
            protected void done() {
                try {
                    ImageIcon profileImage = get();
                    profileImageLabel.setIcon(profileImage);

                    // Update user info labels
                    usernameLabel.setText("Username: " + user.getUsername());
                    fullNameLabel.setText("Full Name: " + user.getFirstname() + " " + user.getLastname());
                    bioLabel.setText("Bio: " + user.getBio());
                } catch (Exception e) {
                    JOptionPane.showMessageDialog(AdminInterface.this, "Failed to load profile image: " + e.getMessage());
                }
            }
        }.execute();
    }

    // Clear profile info method for logout
    private void clearProfileInfo() {
        profileImageLabel.setIcon(new ImageIcon("http://localhost:3000/images/avatars/placeholder.png"));  // Reset to default image
        usernameLabel.setText("Username: ");
        fullNameLabel.setText("Full Name: ");
        bioLabel.setText("Bio: ");
    }
}
