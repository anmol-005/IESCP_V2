export default {
    name: "AdminCampaigns",
    template: `
      <div class="admin-campaigns">
        <main class="container">
          <h1>Campaigns</h1>
  
          <!-- Campaigns Table -->
          <div class="campaigns-table">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Visibility</th>
                  <th>Budget</th>
                  <th>Sponsor</th>
                  <th>Flagged</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="campaign in campaigns" :key="campaign.id">
                  <td>{{ campaign.id }}</td>
                  <td>{{ campaign.name }}</td>
                  <td>{{ campaign.description }}</td>
                  <td>{{ campaign.visibility }}</td>
                  <td>{{ campaign.budget }}</td>
                  <td>{{ campaign.sponsor }}</td>
                  <td>{{ campaign.flagged ? "Yes" : "No" }}</td>
                  <td>
                    <button 
                      @click="toggleFlag(campaign.id, campaign.flagged)" 
                      class="btn btn-warning">
                      {{ campaign.flagged ? "Unflag" : "Flag" }}
                    </button>
                    <button 
                      @click="deleteCampaign(campaign.id)" 
                      class="btn btn-danger">
                      Delete
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </main>
      </div>
    `,
    data() {
      return {
        campaigns: [],
      };
    },
    methods: {
      async fetchCampaigns() {
        try {
          const response = await fetch("/api/admin/campaigns");
          const data = await response.json();
  
          if (response.ok) {
            this.campaigns = data.campaigns || [];
          } else {
            console.error("Error fetching campaigns:", data.error);
          }
        } catch (error) {
          console.error("Error fetching campaigns:", error);
        }
      },
      async toggleFlag(campaignId, isFlagged) {
        const url = `/api/admin/campaigns/${campaignId}/${isFlagged ? "unflag" : "flag"}`;
        try {
          const response = await fetch(url, { method: "POST" });
          const data = await response.json();
  
          if (response.ok) {
            this.fetchCampaigns(); // Refresh the campaigns list
            alert(data.message);
          } else {
            console.error("Error updating flag status:", data.error);
          }
        } catch (error) {
          console.error("Error updating flag status:", error);
        }
      },
      async deleteCampaign(campaignId) {
        if (!confirm("Are you sure you want to delete this campaign?")) return;
  
        try {
          const response = await fetch(`/api/admin/campaigns/${campaignId}`, { method: "DELETE" });
          const data = await response.json();
  
          if (response.ok) {
            this.fetchCampaigns(); // Refresh the campaigns list
            alert(data.message);
          } else {
            console.error("Error deleting campaign:", data.error);
          }
        } catch (error) {
          console.error("Error deleting campaign:", error);
        }
      },
    },
    mounted() {
      this.fetchCampaigns();
    },
  };
  