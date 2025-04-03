export default {
  data() {
    return {
      profile: {
        company_name: "",
        industry: "",
        budget: "",
      },
      message: "", // To show success or error messages
    };
  },
  async created() {
    this.fetchProfile();
  },
  methods: {
    async fetchProfile() {
      try {
        const response = await fetch("/api/sponsor_profile");
        if (!response.ok) throw new Error("Failed to fetch profile");
        this.profile = await response.json();
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    },
    async updateProfile() {
      try {
        const response = await fetch("/api/sponsor_profile", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(this.profile),
        });

        const data = await response.json();
        if (response.ok) {
          this.message = "Profile updated successfully!";
        } else {
          this.message = `Error: ${data.error || "Unknown error"}`;
        }
      } catch (error) {
        console.error("Error updating profile:", error);
        this.message = "Error updating profile. Please try again later.";
      }
    },
  },
  template: `
    <div>
      <h1>Sponsor Profile</h1>
      <p><strong>Company Name:</strong> <input type="text" v-model="profile.company_name" /></p>
      <p><strong>Industry:</strong> <input type="text" v-model="profile.industry" /></p>
      <p><strong>Budget:</strong> <input type="number" v-model="profile.budget" /></p>
      <button @click="updateProfile">Save Changes</button>
      <p v-if="message">{{ message }}</p>
    </div>
  `,
};
