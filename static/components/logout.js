export default {
    template: `
      <div>
        <h1>Logging Out...</h1>
      </div>
    `,
    async created() {
      try {
        const response = await fetch('/api/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
  
        if (response.ok) {
          console.log("Successfully logged out");
          // Redirect to the login page
          this.$router.push('/login');
        } else {
          console.error("Failed to log out:", response.status);
        }
      } catch (error) {
        console.error("Error during logout:", error);
      }
    },
  };
  