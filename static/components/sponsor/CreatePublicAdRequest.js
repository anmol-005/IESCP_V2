export default {
    name: "CreatePublicAdRequest",
    data() {
      return {
        campaigns: [], // Holds the list of public campaigns
        campaignId: null,
        requirements: "",
        paymentAmount: 0,
        errorMessage: "",
        successMessage: "",
      };
    },
    async created() {
      try {
        const response = await fetch("/api/public_campaigns");
        if (!response.ok) {
          throw new Error("Failed to fetch public campaigns");
        }
        this.campaigns = await response.json(); // Assumes API returns an array of campaign objects
      } catch (error) {
        this.errorMessage = "Error fetching campaigns: " + error.message;
      }
    },
    methods: {
      async submitRequest() {
        try {
          const response = await fetch("/api/public_ad_requests", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              campaign_id: this.campaignId,
              requirements: this.requirements,
              payment_amount: this.paymentAmount,
            }),
          });
          if (!response.ok) {
            throw new Error("Failed to create public ad request");
          }
          const data = await response.json();
          this.successMessage = "Public ad request created successfully!";
          this.errorMessage = ""; // Clear any previous errors
        } catch (error) {
          this.errorMessage = error.message;
          this.successMessage = ""; // Clear any previous success messages
        }
      },
    },
    template: `
      <div class="container">
        <h2>Create Public Ad Request</h2>
        <form @submit.prevent="submitRequest">
          <div class="form-group">
            <label for="campaignId">Select Campaign (Public Campaigns Only)</label>
            <select v-model="campaignId" id="campaignId" class="form-control" required>
              <option value="" disabled>Select a campaign</option>
              <option v-for="campaign in campaigns" :key="campaign.id" :value="campaign.id">
                {{ campaign.name }} ({{ campaign.start_date }} - {{ campaign.end_date }})
              </option>
            </select>
          </div>
          <div class="form-group">
            <label for="requirements">Requirements</label>
            <textarea v-model="requirements" id="requirements" class="form-control" required></textarea>
          </div>
          <div class="form-group">
            <label for="paymentAmount">Payment Amount</label>
            <input v-model="paymentAmount" type="number" id="paymentAmount" class="form-control" required />
          </div>
          <button type="submit" class="btn btn-primary">Submit</button>
        </form>
        <div v-if="errorMessage" class="alert alert-danger mt-3">{{ errorMessage }}</div>
        <div v-if="successMessage" class="alert alert-success mt-3">{{ successMessage }}</div>
      </div>
    `,
  };
  