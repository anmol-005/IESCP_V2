export default {
    name: "AdminUsers",
    data() {
      return {
        users: [],
        error: null,
      };
    },
    methods: {
      // Fetch all users
      async fetchUsers() {
        try {
          const response = await fetch("/api/admin/users", { method: "GET" });
          if (!response.ok) {
            throw new Error("Failed to fetch users.");
          }
          const data = await response.json();
          this.users = data.users;
        } catch (error) {
          this.error = error.message;
        }
      },
  
      // Flag a user
      async flagUser(userId) {
        try {
          const response = await fetch(`/api/admin/users/${userId}/flag`, {
            method: "POST",
          });
          if (!response.ok) {
            throw new Error("Failed to flag user.");
          }
          await this.fetchUsers(); // Refresh the list
          alert("User flagged successfully.");
        } catch (error) {
          this.error = error.message;
        }
      },
  
      // Unflag a user
      async unflagUser(userId) {
        try {
          const response = await fetch(`/api/admin/users/${userId}/unflag`, {
            method: "POST",
          });
          if (!response.ok) {
            throw new Error("Failed to unflag user.");
          }
          await this.fetchUsers(); // Refresh the list
          alert("User unflagged successfully.");
        } catch (error) {
          this.error = error.message;
        }
      },
  
      // Delete a user
      async deleteUser(userId) {
        if (!confirm("Are you sure you want to delete this user?")) return;
        try {
          const response = await fetch(`/api/admin/users/${userId}`, {
            method: "DELETE",
          });
          if (!response.ok) {
            throw new Error("Failed to delete user.");
          }
          await this.fetchUsers(); // Refresh the list
          alert("User deleted successfully.");
        } catch (error) {
          this.error = error.message;
        }
      },
    },
    mounted() {
      this.fetchUsers();
    },
    template: `
      <div class="admin-users">
        <main class="container">
          <h1>Admin Users</h1>
  
          <div v-if="error" class="error">{{ error }}</div>
  
          <table class="user-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Flagged</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in users" :key="user.id">
                <td>{{ user.id }}</td>
                <td>{{ user.name }}</td>
                <td>{{ user.email }}</td>
                <td>{{ user.role }}</td>
                <td>{{ user.flagged ? "Yes" : "No" }}</td>
                <td>
                  <button
                    @click="user.flagged ? unflagUser(user.id) : flagUser(user.id)"
                    class="btn"
                  >
                    {{ user.flagged ? "Unflag" : "Flag" }}
                  </button>
                  <button
                    @click="deleteUser(user.id)"
                    class="btn btn-danger"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </main>
      </div>
    `,
  };
  