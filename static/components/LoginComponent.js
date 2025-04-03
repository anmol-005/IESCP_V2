export default {
  template: `
    <div class="login-container">
      <h2>Login</h2>
      <div class="form-group">
        <label for="email">Email:</label>
        <input 
          id="email" 
          placeholder="Enter your email" 
          v-model="email" 
          type="email" 
          class="form-control" 
          required 
        />
      </div>
      <div class="form-group">
        <label for="password">Password:</label>
        <div class="password-container">
          <input 
            id="password" 
            placeholder="Enter your password" 
            v-model="password" 
            :type="showPassword ? 'text' : 'password'" 
            class="form-control" 
            required 
          />
          <i 
            class="eye-icon" 
            :class="showPassword ? 'fa fa-eye-slash' : 'fa fa-eye'" 
            @click="togglePasswordVisibility">
          </i>
        </div>
      </div>
      <button class="btn btn-primary" @click="submitLogin">Login</button>
      <button class="btn btn-secondary" @click="submitAdminLogin">Admin Login</button>
      <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
    </div>
  `,
  data() {
      return {
          email: '',
          password: '',
          showPassword: false,
          errorMessage: null,
      };
  },
  methods: {
    async submitLogin() {
      const loginData = {
        email: this.email,
        password: this.password,
      };

      try {
        console.log("Attempting login with:", this.email);
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(loginData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          this.errorMessage = errorData.error || 'Login failed';
          console.error("Login failed:", errorData);
          return;
        }

        const responseData = await response.json();

        // Check if the account is flagged
        if (responseData.flagged) {
          this.errorMessage = 'Your account has been flagged by the admin. Please contact support.';
          return;
        }

        // Successful login
        console.log("Login successful:", responseData);
        
        // Verify session with debug endpoint
        try {
          const debugResponse = await fetch('/api/auth_debug');
          const debugData = await debugResponse.json();
          console.log("Auth debug data:", debugData);
        } catch (debugError) {
          console.error("Error checking debug endpoint:", debugError);
        }

        // Redirect the user based on their role
        window.location.href = responseData.redirect;

      } catch (error) {
        console.error('Error during login:', error);
        this.errorMessage = 'An unexpected error occurred';
      }
    },

    async submitAdminLogin() {
      try {
        const response = await fetch('/api/admin_login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: this.email, password: this.password }),
        });
        const data = await response.json();
        if (response.ok) {
          alert('Admin login successful');
          this.$router.push('/admin_dashboard'); 
        } else {
          this.errorMessage = data.error || 'Admin login failed';
        }
      } catch (error) {
        this.errorMessage = 'Error logging in';
      }
    },
    
    togglePasswordVisibility() {
      this.showPassword = !this.showPassword;
    },
  },
};
