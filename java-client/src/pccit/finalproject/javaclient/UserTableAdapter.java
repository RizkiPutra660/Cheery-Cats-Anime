package pccit.finalproject.javaclient;

import javax.swing.table.AbstractTableModel;
import java.util.List;

public class UserTableAdapter extends AbstractTableModel {

    private final String[] columnNames = {"Username", "First Name", "Last Name", "Bio"};
    private List<User> users;

    public UserTableAdapter(List<User> users) {
        this.users = users;
    }

    @Override
    public int getRowCount() {
        return users.size();
    }

    @Override
    public int getColumnCount() {
        return columnNames.length;
    }

    @Override
    public Object getValueAt(int rowIndex, int columnIndex) {
        User user = users.get(rowIndex);
        switch (columnIndex) {
            case 0:
                return user.getUsername();
            case 1:
                return user.getFirstname();
            case 2:
                return user.getLastname();
            case 3:
                return user.getBio();
            default:
                return null;
        }
    }

    @Override
    public String getColumnName(int column) {
        return columnNames[column];
    }

    public User getUserAt(int rowIndex) {
        return users.get(rowIndex);
    }

    public void setUsers(List<User> users) {
        this.users = users;
        fireTableDataChanged();
    }

    public void removeUser(int rowIndex) {
        users.remove(rowIndex);
        fireTableRowsDeleted(rowIndex, rowIndex);
    }
}
