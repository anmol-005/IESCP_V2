export default {
    name: "UpdateCampaign",
    props: ["campaignId"],
    data() {
      return {
        campaign: null,
        errorMessage: "",
        successMessage: "",
      };
    },
    mounted() {
      this.fetchCampaign();
    },
    methods: {
      // Fetch campaign details when the component is mounted
      async fetchCampaign() {
        try {
          const response = await fetch(`/api/campaigns/${this.campaignId}`);
          if (!response.ok) {
            throw new Error("Failed to fetch campaign details");
          }
          this.campaign = await response.json();
        } catch (error) {
          this.errorMessage = error.message;
        }
      },
  
      // Update the campaign with new data
      async updateCampaign() {
        try {
          const response = await fetch(`/api/campaigns/${this.campaign.campaign_id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json", // Ensure this header is included
            },
            body: JSON.stringify(this.campaign),
          });
      
          if (!response.ok) {
            throw new Error("Failed to update campaign");
          }
      
          this.successMessage = "Campaign updated successfully!";
          this.errorMessage = "";
        } catch (error) {
          this.errorMessage = error.message;
          this.successMessage = "";
        }
      },
    },
    template: `
      <div class="container">
        <h2>Update Campaign</h2>
        <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>
        <div v-if="successMessage" class="alert alert-success">{{ successMessage }}</div>
        <!-- Campaign Form -->
        <form v-if="campaign" @submit.prevent="updateCampaign">
        <div class="form-group">
            <label for="name">Campaign Name</label>
            <input v-model="campaign.name" id="name" class="form-control" type="text" required />
        </div>
        <div class="form-group">
            <label for="description">Description</label>
            <textarea v-model="campaign.description" id="description" class="form-control" required></textarea>
        </div>
        <div class="form-group">
            <label for="start_date">Start Date</label>
            <input v-model="campaign.start_date" id="start_date" class="form-control" type="date" required />
        </div>
        <div class="form-group">
            <label for="end_date">End Date</label>
            <input v-model="campaign.end_date" id="end_date" class="form-control" type="date" required />
        </div>
        <div class="form-group">
            <label for="budget">Budget</label>
            <input v-model="campaign.budget" id="budget" class="form-control" type="number" required />
        </div>
        <div class="form-group">
            <label for="visibility">Visibility</label>
            <select v-model="campaign.visibility" id="visibility" class="form-control">
            <option value="public">Public</option>
            <option value="private">Private</option>
            </select>
        </div>
        <div class="form-group">
            <label for="goals">Goals</label>
            <textarea v-model="campaign.goals" id="goals" class="form-control"></textarea>
        </div>
        <div class="form-group">
            <label for="niche">Niche</label>
            <input v-model="campaign.niche" id="niche" class="form-control" type="text" />
        </div>
        <button type="submit" class="btn btn-primary mt-3">Update Campaign</button>
        </form>
      </div>
    `,
  };
  