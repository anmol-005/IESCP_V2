export default {
  template: `
    <div>
      <h1>Profile</h1>
      <img v-if="profile.profile_picture" :src="profile.profile_picture" alt="Profile Picture" class="img-thumbnail" />
      <p><strong>Name:</strong> <input type="text" v-model="profile.name" /></p>
      <p><strong>Email:</strong> <input type="text" v-model="profile.email" /></p>
      <p><strong>Category:</strong> <input type="text" v-model="profile.category" /></p>
      <p><strong>Niche:</strong> <input type="text" v-model="profile.niche" /></p>
      <button @click="updateProfile">Save Changes</button>
      <p v-if="message">{{ message }}</p>
    </div>
  `,
  data() {
    return {
      profile: {},
      message: "",
    };
  },
  created() {
    this.fetchProfile();
  },
  methods: {
    fetchProfile() {
      fetch('/api/influencer_profile')
        .then((response) => response.json())
        .then((data) => {
          this.profile = data;
        })
        .catch((error) => console.error("Error fetching profile:", error));
    },
    updateProfile() {
      fetch('/api/influencer_profile', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(this.profile),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.message) {
            this.message = "Profile updated successfully!";
          } else if (data.error) {
            this.message = `Error: ${data.error}`;
          }
        })
        .catch((error) => {
          console.error("Error updating profile:", error);
          this.message = "Error updating profile. Please try again later.";
        });
    },
  },
};
  