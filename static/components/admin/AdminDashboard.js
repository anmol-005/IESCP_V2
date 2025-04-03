// export default {
//   name: "AdminDashboard",
//   template: `
//     <div class="admin-dashboard">
//       <main class="container">
//         <h1>Admin Dashboard</h1>

//         <!-- Stats Section -->
//         <div class="stats">
//           <h2>Statistics</h2>
//           <div class="stat-cards">
//             <div v-for="(value, key) in stats" :key="key" class="stat-card">
//               <h3>{{ key.replace(/_/g, " ").replace(/(?:^|\s)\S/g, (c) => c.toUpperCase()) }}</h3>
//               <p>{{ value }}</p>
//             </div>
//           </div>
//         </div>

//         <!-- Approve Sponsors Section -->
//         <div class="approve-sponsors">
//           <h2>Approve Sponsors</h2>
//           <table>
//             <thead>
//               <tr>
//                 <th>ID</th>
//                 <th>Company Name</th>
//                 <th>Email</th>
//                 <th>Industry</th>
//                 <th>Budget</th>
//                 <th>Status</th>
//                 <th>Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               <tr v-for="sponsor in pendingSponsors" :key="sponsor.id">
//                 <td>{{ sponsor.id }}</td>
//                 <td>{{ sponsor.company_name }}</td>
//                 <td>{{ sponsor.email }}</td>
//                 <td>{{ sponsor.industry }}</td>
//                 <td>{{ sponsor.budget }}</td>
//                 <td>{{ sponsor.status }}</td>
//                 <td>
//                   <button @click="approveSponsor(sponsor.id)" class="btn btn-success">Approve</button>
//                   <button @click="deleteSponsor(sponsor.id)" class="btn btn-danger">Delete</button>
//                 </td>
//               </tr>
//             </tbody>
//           </table>
//         </div>

//         <!-- Users Table -->
//         <div class="flagged-table">
//           <h2>Users</h2>
//           <table>
//             <thead>
//               <tr>
//                 <th>ID</th>
//                 <th>Name / Company</th>
//                 <th>Email</th>
//                 <th>Role</th>
//                 <th>Flagged</th>
//                 <th>Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               <tr v-for="user in users" :key="user.id">
//                 <td>{{ user.id }}</td>
//                 <td>{{ user.name }}</td>
//                 <td>{{ user.email }}</td>
//                 <td>{{ user.role }}</td>
//                 <td>{{ user.flagged ? "Yes" : "No" }}</td>
//                 <td>
//                   <button @click="handleFlagUser(user.id, !user.flagged)" class="btn">
//                     {{ user.flagged ? "Unflag" : "Flag" }}
//                   </button>
//                   <button @click="handleDeleteUser(user.id)" class="btn btn-danger">Delete</button>
//                 </td>
//               </tr>
//             </tbody>
//           </table>
//         </div>

//         <!-- Campaigns Table -->
//         <div class="flagged-table">
//           <h2>Campaigns</h2>
//           <table>
//             <thead>
//               <tr>
//                 <th>ID</th>
//                 <th>Name</th>
//                 <th>Description</th>
//                 <th>Visibility</th>
//                 <th>Budget</th>
//                 <th>Sponsor</th>
//                 <th>Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               <tr v-for="campaign in campaigns" :key="campaign.id">
//                 <td>{{ campaign.id }}</td>
//                 <td>{{ campaign.name }}</td>
//                 <td>{{ campaign.description }}</td>
//                 <td>{{ campaign.visibility }}</td>
//                 <td>{{ campaign.budget }}</td>
//                 <td>{{ campaign.sponsor }}</td>
//                 <td>
//                   <button @click="handleFlagCampaign(campaign.id, !campaign.flagged)" class="btn">
//                     {{ campaign.flagged ? "Unflag" : "Flag" }}
//                   </button>
//                   <button @click="handleDeleteCampaign(campaign.id)" class="btn btn-danger">Delete</button>
//                 </td>
//               </tr>
//             </tbody>
//           </table>
//         </div>
//       </main>
//     </div>
//   `,
//   data() {
//     return {
//       stats: {}, // Initially empty
//       users: [],
//       campaigns: [],
//     };
//   },
//   methods: {
//     async fetchStats() {
//       try {
//         const response = await fetch("/api/admin/stats");
//         if (!response.ok) throw new Error("Failed to fetch stats");
    
//         const data = await response.json();
//         console.log("Raw data from API:", data); // Debugging
//         this.stats = data || {};
//         console.log("Stats set in component:", this.stats); // Debugging
//       } catch (error) {
//         console.error("Error fetching stats:", error);
//       }
//     }
//     ,
//     async fetchUsers() {
//       try {
//         const response = await fetch("/api/admin/users");
//         const data = await response.json();
//         this.users = data.users || [];
//       } catch (error) {
//         console.error("Error fetching users:", error);
//       }
//     },
//     async fetchCampaigns() {
//       try {
//         const response = await fetch("/api/admin/campaigns");
//         const data = await response.json();
//         this.campaigns = data.campaigns || [];
//       } catch (error) {
//         console.error("Error fetching campaigns:", error);
//       }
//     },
//     async handleFlagUser(userId, flag) {
//       try {
//         await fetch(`/api/admin/users/${userId}/${flag ? "flag" : "unflag"}`, {
//           method: "POST",
//         });
//         this.fetchUsers(); // Refresh user list
//       } catch (error) {
//         console.error("Error flagging user:", error);
//       }
//     },
//     async handleDeleteUser(userId) {
//       try {
//         await fetch(`/api/admin/users/${userId}`, {
//           method: "DELETE",
//         });
//         this.fetchUsers(); // Refresh user list
//       } catch (error) {
//         console.error("Error deleting user:", error);
//       }
//     },
//     async handleFlagCampaign(campaignId, flag) {
//       try {
//         await fetch(`/api/admin/campaigns/${campaignId}/${flag ? "flag" : "unflag"}`, {
//           method: "POST",
//         });
//         this.fetchCampaigns(); // Refresh campaign list
//       } catch (error) {
//         console.error("Error flagging campaign:", error);
//       }
//     },
//     async handleDeleteCampaign(campaignId) {
//       try {
//         await fetch(`/api/admin/campaigns/${campaignId}`, {
//           method: "DELETE",
//         });
//         this.fetchCampaigns(); // Refresh campaign list
//       } catch (error) {
//         console.error("Error deleting campaign:", error);
//       }
//     },
//   },
//   mounted() {
//     console.log("Component mounted, fetching stats...");
//     this.fetchStats();
//     this.fetchUsers();
//     this.fetchCampaigns();
//   },
// };

export default {
  name: "AdminDashboard",
  template: `
    <div class="admin-dashboard">
      <main class="container">
        <h1>Admin Dashboard</h1>

        <!-- Stats Section -->
        <div class="stats">
          <h2>Statistics</h2>
          <div class="stat-cards">
            <div v-for="(value, key) in stats" :key="key" class="stat-card">
              <h3>{{ key.replace(/_/g, " ").replace(/(?:^|\s)\S/g, (c) => c.toUpperCase()) }}</h3>
              <p>{{ value }}</p>
            </div>
          </div>
        </div>

        <!-- Approve Sponsors Section -->
        <div class="approve-sponsors">
          <h2>Approve Sponsors</h2>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Company Name</th>
                <th>Email</th>
                <th>Industry</th>
                <th>Budget</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="sponsor in pendingSponsors" :key="sponsor.id">
                <td>{{ sponsor.id }}</td>
                <td>{{ sponsor.company_name }}</td>
                <td>{{ sponsor.email }}</td>
                <td>{{ sponsor.industry }}</td>
                <td>{{ sponsor.budget }}</td>
                <td>{{ sponsor.status }}</td>
                <td>
                  <button @click="approveSponsor(sponsor.id)" class="btn btn-success">Approve</button>
                  <button @click="deleteSponsor(sponsor.id)" class="btn btn-danger">Delete</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Users Table -->
        <div class="flagged-table">
          <h2>Users</h2>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name / Company</th>
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
                  <button @click="handleFlagUser(user.id, !user.flagged)" class="btn">
                    {{ user.flagged ? "Unflag" : "Flag" }}
                  </button>
                  <button @click="handleDeleteUser(user.id)" class="btn btn-danger">Delete</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Campaigns Table -->
        <div class="flagged-table">
          <h2>Campaigns</h2>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Description</th>
                <th>Visibility</th>
                <th>Budget</th>
                <th>Sponsor</th>
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
                <td>
                  <button @click="handleFlagCampaign(campaign.id, !campaign.flagged)" class="btn">
                    {{ campaign.flagged ? "Unflag" : "Flag" }}
                  </button>
                  <button @click="handleDeleteCampaign(campaign.id)" class="btn btn-danger">Delete</button>
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
      stats: {},
      users: [],
      campaigns: [],
      pendingSponsors: [],
    };
  },
  methods: {
    // Fetch data using async functions
    async fetchData() {
      try {
        const statsResponse = await fetch("/api/admin/stats");
        this.stats = await statsResponse.json();

        const usersResponse = await fetch("/api/admin/users");
        const usersData = await usersResponse.json();
        this.users = usersData.users;

        const campaignsResponse = await fetch("/api/admin/campaigns");
        const campaignsData = await campaignsResponse.json();
        this.campaigns = campaignsData.campaigns;

        const sponsorsResponse = await fetch("/api/admin/sponsors/pending");
        const sponsorsData = await sponsorsResponse.json();
        this.pendingSponsors = sponsorsData.sponsors;
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    },

    async handleFlagUser(userId, flag) {
      try {
        await fetch(`/api/admin/users/${userId}/${flag ? "flag" : "unflag"}`, {
          method: "POST",
        });
        this.fetchUsers(); // Refresh user list
      } catch (error) {
        console.error("Error flagging user:", error);
      }
    },
    async handleDeleteUser(userId) {
      try {
        await fetch(`/api/admin/users/${userId}`, {
          method: "DELETE",
        });
        this.fetchUsers(); // Refresh user list
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    },
    async handleFlagCampaign(campaignId, flag) {
      try {
        await fetch(`/api/admin/campaigns/${campaignId}/${flag ? "flag" : "unflag"}`, {
          method: "POST",
        });
        this.fetchCampaigns(); // Refresh campaign list
      } catch (error) {
        console.error("Error flagging campaign:", error);
      }
    },
    async handleDeleteCampaign(campaignId) {
      try {
        await fetch(`/api/admin/campaigns/${campaignId}`, {
          method: "DELETE",
        });
        this.fetchCampaigns(); // Refresh campaign list
      } catch (error) {
        console.error("Error deleting campaign:", error);
      }
    },

    // Approve sponsor
    async approveSponsor(id) {
      try {
        const response = await fetch(`/api/admin/sponsors/${id}/approve`, { method: "POST" });
        const data = await response.json();
        if (response.ok) {
          this.fetchData(); // Refresh data
        } else {
          console.error("Error approving sponsor:", data.error);
        }
      } catch (error) {
        console.error("Error approving sponsor:", error);
      }
    },

    // Delete sponsor
    async deleteSponsor(id) {
      try {
        const response = await fetch(`/api/admin/sponsors/${id}`, { method: "DELETE" });
        const data = await response.json();
        if (response.ok) {
          this.fetchData(); // Refresh data
        } else {
          console.error("Error deleting sponsor:", data.error);
        }
      } catch (error) {
        console.error("Error deleting sponsor:", error);
      }
    },
  },
  async mounted() {
    await this.fetchData();
  },
};



