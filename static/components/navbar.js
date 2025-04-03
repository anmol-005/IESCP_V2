export default {
  template: `
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
      <router-link class="navbar-brand" to="/">Influencer Platform</router-link>
      <button
        class="navbar-toggler"
        type="button"
        data-toggle="collapse"
        data-target="#navbarNav"
        aria-controls="navbarNav"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav ml-auto">
          <!-- Links for Guests -->
          <li class="nav-item" v-if="!isLoggedIn">
            <router-link class="nav-link" to="/login">Login</router-link>
          </li>
          <li class="nav-item" v-if="!isLoggedIn">
            <router-link class="nav-link" to="/register">Register</router-link>
          </li>

          <!-- Links for Sponsors -->
          <template v-if="isLoggedIn && userRole === 'sponsor'">
            <li class="nav-item">
              <router-link class="nav-link" to="/sponsor_dashboard">Sponsor Dashboard</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/sponsor_profile">Sponsor Profile</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/manage_campaigns">Manage Campaigns</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/manage_ad_requests">Manage Ad Requests</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/search">Search</router-link>
            </li>
          </template>

          <!-- Links for Influencers -->
          <template v-if="isLoggedIn && userRole === 'influencer'">
            <li class="nav-item">
              <router-link class="nav-link" to="/influencer_dashboard">Dashboard</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/influencer_profile">Profile</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/completed_ad_requests">Completed Ad Requests</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/search">Search</router-link>
            </li>
          </template>

          <template v-if="isLoggedIn && userRole === 'admin'">
            <li class="nav-item">
              <router-link class="nav-link" to="/admin_dashboard">Dashboard</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/admin_users">Users</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/admin_campaigns">Campaigns</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/admin_ad_requests">Ad Requests</router-link>
            </li>
          </template>

          <!-- Logout Link -->
          <li class="nav-item" v-if="isLoggedIn">
            <router-link class="nav-link" to="/logout">Logout</router-link>
          </li>
        </ul>
      </div>
    </nav>
  `,
  data() {
    return {
      isLoggedIn: false,
      userRole: null,
    };
  },
  created() {
    this.fetchUserData();
  },
  watch: {
    // Watch for route changes to refresh user data
    '$route': 'fetchUserData'
  },
  methods: {
    async fetchUserData() {
      try {
        console.log("Navbar: Fetching user data...");
        
        // Regular endpoint
        const response = await fetch('/api/get_user_data');
        
        // Also check debug endpoint
        try {
          const debugResponse = await fetch('/api/auth_debug');
          const debugData = await debugResponse.json();
          console.log("Navbar: Auth debug data:", debugData);
        } catch (debugError) {
          console.error("Navbar: Error checking debug endpoint:", debugError);
        }
        
        if (response.ok) {
          const data = await response.json();
          // Set user data from the response
          this.isLoggedIn = data.isLoggedIn;
          this.userRole = data.role;
          console.log("Navbar: User data loaded:", data);
        } else {
          console.error("Navbar: Failed to fetch user data:", response.status);
          // Clear user data on error
          this.isLoggedIn = false;
          this.userRole = null;
        }
      } catch (error) {
        console.error("Navbar: Error fetching user data:", error);
        // Clear user data on error
        this.isLoggedIn = false;
        this.userRole = null;
      }
    }
  }
};

