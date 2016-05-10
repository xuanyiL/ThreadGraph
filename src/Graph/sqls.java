package Graph;

import java.sql.*;

public class sqls {
    private Connection con = null;
    public Statement Connect(String strdb) {
        String url = "jdbc:mysql://localhost:3307/";
        String db = strdb;
        String driver = "com.mysql.jdbc.Driver";
        String user = "root";
      String pass = "1234";
        try {
            Class.forName(driver);
            this.con = DriverManager.getConnection(url + db, user, pass);
            Statement stmt = con.createStatement();
            return stmt;
        } catch (Exception e) {
            System.out.println(e);
            e.printStackTrace();
        }
        return null;

    }
        
    public void Close() {
        try {
            if(this.con != null) {
                this.con.close();
            }
        } catch(SQLException e) {
            e.printStackTrace();
        }

    }


}
