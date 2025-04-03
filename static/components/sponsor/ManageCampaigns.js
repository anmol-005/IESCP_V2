// export default {
//   name: "ManageCampaigns",
//   data() {
//     return {
//       activeCampaigns: [],
//       previousCampaigns: [],
//       newCampaign: {
//         name: "",
//         description: "",
//         start_date: "",
//         end_date: "",
//         budget: "",
//         visibility: "",
//         niche: "",
//         goals: "",
//       },
//       campaignToUpdate: null, // Added initialization
//       errorMessage: "",
//       successMessage: "",
//       sponsorStatus: "", // To store the current user's status
//     };
//   },
//   methods: {
//     fetchCampaigns() {
//       fetch("/api/campaigns")
//         .then((response) => {
//           if (!response.ok) throw new Error("Failed to fetch campaigns.");
//           return response.json();
//         })
//         .then((data) => {
//           this.activeCampaigns = data.active_campaigns;
//           this.previousCampaigns = data.previous_campaigns;
//         })
//         .catch((error) => {
//           this.errorMessage = error.message;
//         });

//       // Fetch the current user's status
//       fetch("/api/user")
//         .then((response) => {
//           if (!response.ok) throw new Error("Failed to fetch user info.");
//           return response.json();
//         })
//         .then((data) => {
//           this.sponsorStatus = data.status;
//         })
//         .catch((error) => {
//           this.errorMessage = error.message;
//         });
//     },
//     createCampaign() {
//       if (this.sponsorStatus === "pending") {
//         this.errorMessage =
//           "Your account is pending approval. You cannot create campaigns.";
//         return;
//       }

//       fetch("/api/create_campaigns", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(this.newCampaign),
//       })
//         .then((response) => {
//           if (!response.ok) throw new Error("Failed to create campaign.");
//           return response.json();
//         })
//         .then((data) => {
//           this.successMessage = data.message;
//           this.fetchCampaigns();
//           this.newCampaign = {
//             name: "",
//             description: "",
//             start_date: "",
//             end_date: "",
//             budget: "",
//             visibility: "",
//             niche: "",
//             goals: "",
//           };
//         })
//         .catch((error) => {
//           this.errorMessage = error.message;
//         });
//     },
//     deleteCampaign(campaignId) {
//       fetch(`/api/campaigns/${campaignId}`, {
//         method: "DELETE",
//         headers: {
//           "Content-Type": "application/json",
//         },
//       })
//         .then((response) => {
//           if (!response.ok) {
//             return response.json().then((data) => {
//               throw new Error(data.error || "Failed to delete campaign.");
//             });
//           }
//           return response.json();
//         })
//         .then((data) => {
//           this.successMessage = data.message;
//           this.fetchCampaigns(); // Refresh the campaigns list
//         })
//         .catch((error) => {
//           this.errorMessage = error.message;
//         });
//     },
//     redirectToUpdate(campaignId) {
//       this.$router.push({ name: "update_campaign", params: { campaignId } });
//     },
//   },
//   mounted() {
//     this.fetchCampaigns();
//   },
//   template: `
//     <div>
//       <h1>Manage Campaigns</h1>
//       <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>
//       <div v-if="successMessage" class="alert alert-success">{{ successMessage }}</div>

//       <section>
//         <h2>Create New Campaign</h2>
//         <form @submit.prevent="createCampaign">
//           <div>
//             <label for="name">Name</label>
//             <input v-model="newCampaign.name" id="name" type="text" required />
//           </div>
//           <div>
//             <label for="description">Description</label>
//             <textarea v-model="newCampaign.description" id="description" required></textarea>
//           </div>
//           <div>
//             <label for="start_date">Start Date</label>
//             <input v-model="newCampaign.start_date" id="start_date" type="date" required />
//           </div>
//           <div>
//             <label for="end_date">End Date</label>
//             <input v-model="newCampaign.end_date" id="end_date" type="date" required />
//           </div>
//           <div>
//             <label for="budget">Budget</label>
//             <input v-model="newCampaign.budget" id="budget" type="number" step="0.01" required />
//           </div>
//           <div>
//             <label for="visibility">Visibility</label>
//             <select v-model="newCampaign.visibility" id="visibility" required>
//               <option value="public">Public</option>
//               <option value="private">Private</option>
//             </select>
//           </div>
//           <div>
//             <label for="niche">Niche</label>
//             <input v-model="newCampaign.niche" id="niche" type="text" required />
//           </div>
//           <div>
//             <label for="goals">Goals</label>
//             <textarea v-model="newCampaign.goals" id="goals" required></textarea>
//           </div>
//           <button type="submit">Add Campaign</button>
//         </form>
//       </section>

//       <section>
//         <h2>Active Campaigns</h2>
//         <table>
//           <thead>
//             <tr>
//               <th>ID</th>
//               <th>Name</th>
//               <th>Start Date</th>
//               <th>End Date</th>
//               <th>Visibility</th>
//               <th>Budget</th>
//               <th>Niche</th>
//               <th>Goals</th>
//               <th>Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             <tr v-if="activeCampaigns.length === 0">
//               <td colspan="9">No active campaigns available.</td>
//             </tr>
//             <tr v-for="campaign in activeCampaigns" :key="campaign.id">
//               <td>{{ campaign.id }}</td>
//               <td>{{ campaign.name }}</td>
//               <td>{{ campaign.start_date }}</td>
//               <td>{{ campaign.end_date }}</td>
//               <td>{{ campaign.visibility }}</td>
//               <td>{{ campaign.budget }}</td>
//               <td>{{ campaign.niche }}</td>
//               <td>{{ campaign.goals }}</td>
//               <td>
//                 <button class="btn btn-primary" @click="redirectToUpdate(campaign.id)">Update</button>
//                 <button @click="deleteCampaign(campaign.id)">Delete</button>
//               </td>
//             </tr>
//           </tbody>
//         </table>
//       </section>

//       <section>
//         <h2>Previous Campaigns</h2>
//         <table>
//           <thead>
//             <tr>
//               <th>ID</th>
//               <th>Name</th>
//               <th>Start Date</th>
//               <th>End Date</th>
//               <th>Visibility</th>
//               <th>Budget</th>
//               <th>Niche</th>
//               <th>Goals</th>
//             </tr>
//           </thead>
//           <tbody>
//             <tr v-if="previousCampaigns.length === 0">
//               <td colspan="8">No previous campaigns available.</td>
//             </tr>
//             <tr v-for="campaign in previousCampaigns" :key="campaign.id">
//               <td>{{ campaign.id }}</td>
//               <td>{{ campaign.name }}</td>
//               <td>{{ campaign.start_date }}</td>
//               <td>{{ campaign.end_date }}</td>
//               <td>{{ campaign.visibility }}</td>
//               <td>{{ campaign.budget }}</td>
//               <td>{{ campaign.niche }}</td>
//               <td>{{ campaign.goals }}</td>
//             </tr>
//           </tbody>
//         </table>
//       </section>
//     </div>
//   `,
// };







export default {
  name: "ManageCampaigns",
  data() {
    return {
      activeCampaigns: [],
      previousCampaigns: [],
      newCampaign: {
        name: "",
        description: "",
        start_date: "",
        end_date: "",
        budget: "",
        visibility: "",
        niche: "",
        goals: "",
      },
      campaignToUpdate: null, // Added initialization
      errorMessage: "",
      successMessage: "",
      sponsorStatus: "", // To store the current user's status
      isFlagged: false,  // To track if the user is flagged
    };
  },
  methods: {
    fetchCampaigns() {
      fetch("/api/campaigns")
        .then((response) => {
          if (!response.ok) throw new Error("Failed to fetch campaigns.");
          return response.json();
        })
        .then((data) => {
          this.activeCampaigns = data.active_campaigns;
          this.previousCampaigns = data.previous_campaigns;
        })
        .catch((error) => {
          this.errorMessage = error.message;
        });

      // Fetch the current user's status and flagged status
      fetch("/api/user")
        .then((response) => {
          if (!response.ok) throw new Error("Failed to fetch user info.");
          return response.json();
        })
        .then((data) => {
          this.sponsorStatus = data.status;
          this.isFlagged = data.flagged; // Check if the user is flagged
        })
        .catch((error) => {
          this.errorMessage = error.message;
        });
    },
    createCampaign() {
      if (this.sponsorStatus === "pending") {
        this.errorMessage =
          "Your account is pending approval. You cannot create campaigns.";
        return;
      }

      if (this.isFlagged) {
        this.errorMessage =
          "Your account is flagged. Please contact the admin to resolve this issue.";
        return;
      }

      fetch("/api/create_campaigns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(this.newCampaign),
      })
        .then((response) => {
          if (!response.ok) throw new Error("Failed to create campaign.");
          return response.json();
        })
        .then((data) => {
          this.successMessage = data.message;
          this.fetchCampaigns();
          this.newCampaign = {
            name: "",
            description: "",
            start_date: "",
            end_date: "",
            budget: "",
            visibility: "",
            niche: "",
            goals: "",
          };
        })
        .catch((error) => {
          this.errorMessage = error.message;
        });
    },
    deleteCampaign(campaignId) {
      if (this.isFlagged) {
        this.errorMessage =
          "Your account is flagged. You cannot delete campaigns.";
        return;
      }

      fetch(`/api/campaigns/${campaignId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          if (!response.ok) {
            return response.json().then((data) => {
              throw new Error(data.error || "Failed to delete campaign.");
            });
          }
          return response.json();
        })
        .then((data) => {
          this.successMessage = data.message;
          this.fetchCampaigns(); // Refresh the campaigns list
        })
        .catch((error) => {
          this.errorMessage = error.message;
        });
    },
    redirectToUpdate(campaignId) {
      if (this.isFlagged) {
        this.errorMessage =
          "Your account is flagged. You cannot update campaigns.";
        return;
      }
      this.$router.push({ name: "update_campaign", params: { campaignId } });
    },
  },
  mounted() {
    this.fetchCampaigns();
  },
  template: `
    <div>
      <h1>Manage Campaigns</h1>
      <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>
      <div v-if="successMessage" class="alert alert-success">{{ successMessage }}</div>

      <div v-if="isFlagged">
        <h2>Your account is flagged</h2>
        <p>Please contact the admin to resolve this issue. You cannot create, update, or delete campaigns.</p>
      </div>

      <div v-else>
        <section>
          <h2>Create New Campaign</h2>
          <form @submit.prevent="createCampaign">
            <div>
              <label for="name">Name</label>
              <input v-model="newCampaign.name" id="name" type="text" required />
            </div>
            <div>
              <label for="description">Description</label>
              <textarea v-model="newCampaign.description" id="description" required></textarea>
            </div>
            <div>
              <label for="start_date">Start Date</label>
              <input v-model="newCampaign.start_date" id="start_date" type="date" required />
            </div>
            <div>
              <label for="end_date">End Date</label>
              <input v-model="newCampaign.end_date" id="end_date" type="date" required />
            </div>
            <div>
              <label for="budget">Budget</label>
              <input v-model="newCampaign.budget" id="budget" type="number" step="0.01" required />
            </div>
            <div>
              <label for="visibility">Visibility</label>
              <select v-model="newCampaign.visibility" id="visibility" required>
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </div>
            <div>
              <label for="niche">Niche</label>
              <input v-model="newCampaign.niche" id="niche" type="text" required />
            </div>
            <div>
              <label for="goals">Goals</label>
              <textarea v-model="newCampaign.goals" id="goals" required></textarea>
            </div>
            <button type="submit">Add Campaign</button>
          </form>
        </section>

        <section>
          <h2>Active Campaigns</h2>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Visibility</th>
                <th>Budget</th>
                <th>Niche</th>
                <th>Goals</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="activeCampaigns.length === 0">
                <td colspan="9">No active campaigns available.</td>
              </tr>
              <tr v-for="campaign in activeCampaigns" :key="campaign.id">
                <td>{{ campaign.id }}</td>
                <td>{{ campaign.name }}</td>
                <td>{{ campaign.start_date }}</td>
                <td>{{ campaign.end_date }}</td>
                <td>{{ campaign.visibility }}</td>
                <td>{{ campaign.budget }}</td>
                <td>{{ campaign.niche }}</td>
                <td>{{ campaign.goals }}</td>
                <td>
                  <button class="btn btn-primary" @click="redirectToUpdate(campaign.id)">Update</button>
                  <button @click="deleteCampaign(campaign.id)">Delete</button>
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        <section>
          <h2>Previous Campaigns</h2>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Visibility</th>
                <th>Budget</th>
                <th>Niche</th>
                <th>Goals</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="previousCampaigns.length === 0">
                <td colspan="8">No previous campaigns available.</td>
              </tr>
              <tr v-for="campaign in previousCampaigns" :key="campaign.id">
                <td>{{ campaign.id }}</td>
                <td>{{ campaign.name }}</td>
                <td>{{ campaign.start_date }}</td>
                <td>{{ campaign.end_date }}</td>
                <td>{{ campaign.visibility }}</td>
                <td>{{ campaign.budget }}</td>
                <td>{{ campaign.niche }}</td>
                <td>{{ campaign.goals }}</td>
              </tr>
            </tbody>
          </table>
        </section>
      </div>
    </div>
  `,
};
