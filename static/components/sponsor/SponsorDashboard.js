// export default {
//   template: `
//     <div>
//       <navbar></navbar>
//       <div class="container mt-4">
//         <h1>Welcome, {{ userCompanyName }}</h1>

//         <!-- Active Campaigns Section -->
//         <section>
//           <h2>Active Campaigns</h2>
//           <button @click="exportCampaigns" class="btn btn-primary mb-3">Export Campaigns as CSV</button>
//           <table v-if="activeCampaigns.length" class="table table-bordered">
//             <thead>
//               <tr>
//                 <th>ID</th>
//                 <th>Name</th>
//                 <th>Description</th>
//                 <th>Visibility</th>
//                 <th>Start Date</th>
//                 <th>End Date</th>
//                 <th>Budget</th>
//               </tr>
//             </thead>
//             <tbody>
//               <tr v-for="campaign in activeCampaigns" :key="campaign.id">
//                 <td>{{ campaign.id }}</td>
//                 <td>{{ campaign.name }}</td>
//                 <td>{{ campaign.description }}</td>
//                 <td>{{ campaign.visibility }}</td>
//                 <td>{{ campaign.start_date }}</td>
//                 <td>{{ campaign.end_date }}</td>
//                 <td>{{ campaign.budget }}</td>
//               </tr>
//             </tbody>
//           </table>
//           <p v-else>No active campaigns.</p>
//         </section>

//         <!-- Received Ad Requests Section -->
//         <section>
//           <h2>Received Ad Requests (Public Campaigns)</h2>
//           <table v-if="receivedAdRequests.length" class="table table-bordered">
//             <thead>
//               <tr>
//                 <th>Campaign</th>
//                 <th>Influencer</th>
//                 <th>Requirements</th>
//                 <th>Payment Amount</th>
//                 <th>Action</th>
//               </tr>
//             </thead>
//             <tbody>
//               <tr v-for="adRequest in receivedAdRequests" :key="adRequest.ad_request_id">
//                 <td>{{ adRequest.campaign_name }}</td>
//                 <td>{{ adRequest.influencer_name }}</td>
//                 <td>{{ adRequest.requirements }}</td>
//                 <td>{{ adRequest.payment_amount }}</td>
//                 <td>
//                   <button @click="acceptAdRequest(adRequest.ad_request_id)" class="btn btn-success btn-sm">Accept</button>
//                   <button @click="rejectAdRequest(adRequest.ad_request_id)" class="btn btn-danger btn-sm">Reject</button>
//                 </td>
//               </tr>
//             </tbody>
//           </table>
//           <p v-else>No received ad requests for public campaigns.</p>
//         </section>

//         <!-- Sent Ad Requests Section -->
//         <section>
//           <h2>Sent Ad Requests (Private Campaigns)</h2>
//           <table v-if="sentAdRequests.length" class="table table-bordered">
//             <thead>
//               <tr>
//                 <th>Campaign</th>
//                 <th>Influencer</th>
//                 <th>Payment Amount</th>
//                 <th>Status</th>
//               </tr>
//             </thead>
//             <tbody>
//               <tr v-for="adRequest in sentAdRequests" :key="adRequest.ad_request_id">
//                 <td>{{ adRequest.campaign_name }}</td>
//                 <td>{{ adRequest.influencer_name }}</td>
//                 <td>{{ adRequest.payment_amount }}</td>
//                 <td>{{ adRequest.status }}</td>
//               </tr>
//             </tbody>
//           </table>
//           <p v-else>No sent ad requests for private campaigns.</p>
//         </section>
//       </div>
//     </div>
//   `,
//   data() {
//     return {
//       userCompanyName: '', // Load from API or session data
//       sponsorId: null,
//       activeCampaigns: [],
//       receivedAdRequests: [],
//       sentAdRequests: [],
//     };
//   },
//   created() {
//     this.fetchDashboardData();
//     this.fetchUserData();
//   },
//   methods: {
//     fetchUserData() {
//       fetch('/api/user')
//         .then((res) => res.json())
//         .then((data) => {
//           this.userCompanyName = data.company_name;
//           this.sponsorId = data.id; // Assuming the response contains the user's ID
//         })
//         .catch((error) => {
//           console.error('Error fetching user data:', error);
//         });
//     },
//     exportCampaigns() {
//       if (!this.sponsorId) {
//         alert('Sponsor ID is not available. Please try again later.');
//         return;
//       }
  
//       fetch('/export/campaigns', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ sponsor_id: this.sponsorId }),
//       })
//         .then((response) => {
//           if (!response.ok) {
//             throw new Error(`HTTP error! status: ${response.status}`);
//           }
//           return response.json();
//         })
//         .then((data) => {
//           console.log('Export Task:', data);
//           alert('Export initiated. Task ID: ' + data.task_id);
//         })
//         .catch((error) => {
//           console.error('Error exporting campaigns:', error);
//           alert('Error exporting campaigns: ' + error.message);
//         });
//     },  
//     fetchDashboardData() {
//       fetch('/api/sponsor/active_campaigns')
//         .then((res) => res.json())
//         .then((data) => {
//           this.activeCampaigns = data;
//         });

//       fetch('/api/sponsor/received_ad_requests')
//         .then((res) => res.json())
//         .then((data) => {
//           this.receivedAdRequests = data;
//         });

//       fetch('/api/sponsor/sent_ad_requests')
//         .then((res) => res.json())
//         .then((data) => {
//           this.sentAdRequests = data;
//         });
//     },
//     exportCampaigns() {
//       if (!this.sponsorId) {
//         alert('Sponsor ID is not available. Please try again later.');
//         return;
//       }
//       fetch('/export/campaigns', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ sponsor_id: this.sponsorId }),
//       })
//         .then((response) => {
//           if (!response.ok) {
//             throw new Error(`HTTP error! status: ${response.status}`);
//           }
//           return response.json();
//         })
//         .then((data) => {
//           console.log('Export Task:', data);
//           alert('Export initiated. Task ID: ' + data.task_id);
//         })
//         .catch((error) => {
//           console.error('Error exporting campaigns:', error);
//           alert('Error exporting campaigns: ' + error.message);
//         });
//     },
    
//     acceptAdRequest(adRequestId) {
//       fetch(`/api/sponsor/accept_ad_requests/${adRequestId}`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       })
//         .then((res) => res.json())
//         .then((data) => {
//           alert(data.message || 'Ad request accepted successfully');
//           this.receivedAdRequests = this.receivedAdRequests.filter(
//             (adRequest) => adRequest.ad_request_id !== adRequestId
//           );
//         })
//         .catch((error) => {
//           console.error('Error:', error);
//           alert('Failed to accept ad request.');
//         });
//     },
//     rejectAdRequest(adRequestId) {
//       fetch(`/api/sponsor/reject_ad_requests/${adRequestId}`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       })
//         .then((res) => res.json())
//         .then((data) => {
//           alert(data.message || 'Ad request rejected successfully');
//           this.receivedAdRequests = this.receivedAdRequests.filter(
//             (adRequest) => adRequest.ad_request_id !== adRequestId
//           );
//         })
//         .catch((error) => {
//           console.error('Error:', error);
//           alert('Failed to reject ad request.');
//         });
//     },
//   },
// };


export default {
  template: `
    <div>
      <navbar v-if="isAllowed"></navbar>
      <div v-if="isAllowed" class="container mt-4">
        <h1>Welcome {{ userCompanyName }}</h1>

        <!-- Active Campaigns Section -->
        <section>
          <h2>Active Campaigns</h2>
          <button @click="exportCampaigns" class="btn btn-primary mb-3">Export Campaigns as CSV</button>
          <table v-if="activeCampaigns.length" class="table table-bordered">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Description</th>
                <th>Visibility</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Budget</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="campaign in activeCampaigns" :key="campaign.id">
                <td>{{ campaign.id }}</td>
                <td>{{ campaign.name }}</td>
                <td>{{ campaign.description }}</td>
                <td>{{ campaign.visibility }}</td>
                <td>{{ campaign.start_date }}</td>
                <td>{{ campaign.end_date }}</td>
                <td>{{ campaign.budget }}</td>
              </tr>
            </tbody>
          </table>
          <p v-else>No active campaigns.</p>
        </section>

        <!-- Received Ad Requests Section -->
        <section>
          <h2>Received Ad Requests (Public Campaigns)</h2>
          <table v-if="receivedAdRequests.length" class="table table-bordered">
            <thead>
              <tr>
                <th>Campaign</th>
                <th>Influencer</th>
                <th>Requirements</th>
                <th>Payment Amount</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="adRequest in receivedAdRequests" :key="adRequest.ad_request_id">
                <td>{{ adRequest.campaign_name }}</td>
                <td>{{ adRequest.influencer_name }}</td>
                <td>{{ adRequest.requirements }}</td>
                <td>{{ adRequest.payment_amount }}</td>
                <td>
                  <button @click="acceptAdRequest(adRequest.ad_request_id)" class="btn btn-success btn-sm">Accept</button>
                  <button @click="rejectAdRequest(adRequest.ad_request_id)" class="btn btn-danger btn-sm">Reject</button>
                </td>
              </tr>
            </tbody>
          </table>
          <p v-else>No received ad requests for public campaigns.</p>
        </section>

        <!-- Sent Ad Requests Section -->
        <section>
          <h2>Sent Ad Requests (Private Campaigns)</h2>
          <table v-if="sentAdRequests.length" class="table table-bordered">
            <thead>
              <tr>
                <th>Campaign</th>
                <th>Influencer</th>
                <th>Payment Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="adRequest in sentAdRequests" :key="adRequest.ad_request_id">
                <td>{{ adRequest.campaign_name }}</td>
                <td>{{ adRequest.influencer_name }}</td>
                <td>{{ adRequest.payment_amount }}</td>
                <td>{{ adRequest.status }}</td>
              </tr>
            </tbody>
          </table>
          <p v-else>No sent ad requests for private campaigns.</p>
        </section>
      </div>

      <!-- Pending or Flagged Message -->
      <div v-else class="text-center mt-4">
        <h1>Your account is flagged or under review. Please wait for admin action.</h1>
      </div>
    </div>
  `,
  data() {
    return {
      userCompanyName: '',
      sponsorId: null,
      activeCampaigns: [],
      receivedAdRequests: [],
      sentAdRequests: [],
      isAllowed: true, // Determines if the dashboard is accessible
    };
  },
  created() {
    this.fetchUserData();
    this.fetchDashboardData();
  },
  methods: {
    fetchUserData() {
      fetch('/api/user')
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            console.error(data.error);
            return;
          }
          this.userCompanyName = data.name || '';
          this.sponsorId = data.id || null;

          // Determine access based on status and flagged state
          this.isAllowed = data.status === 'approved' && !data.flagged;
        })
        .catch((error) => {
          console.error('Error fetching user data:', error);
        });
    },
    fetchDashboardData() {
      if (!this.isAllowed) return; // Skip fetching if access is restricted

      fetch('/api/sponsor/active_campaigns')
        .then((res) => res.json())
        .then((data) => {
          this.activeCampaigns = data;
        })
        .catch((error) => console.error('Error fetching active campaigns:', error));

      fetch('/api/sponsor/received_ad_requests')
        .then((res) => res.json())
        .then((data) => {
          this.receivedAdRequests = data;
        })
        .catch((error) => console.error('Error fetching received ad requests:', error));

      fetch('/api/sponsor/sent_ad_requests')
        .then((res) => res.json())
        .then((data) => {
          this.sentAdRequests = data;
        })
        .catch((error) => console.error('Error fetching sent ad requests:', error));
    },
    exportCampaigns() {
      if (!this.sponsorId) {
        alert('Sponsor ID is not available. Please try again later.');
        return;
      }
      fetch('/export/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sponsor_id: this.sponsorId }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          alert('Export initiated. Task ID: ' + data.task_id);
        })
        .catch((error) => {
          console.error('Error exporting campaigns:', error);
          alert('Error exporting campaigns: ' + error.message);
        });
    },
    acceptAdRequest(adRequestId) {
      fetch(`/api/sponsor/accept_ad_requests/${adRequestId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then((res) => res.json())
        .then((data) => {
          alert(data.message || 'Ad request accepted successfully');
          this.receivedAdRequests = this.receivedAdRequests.filter(
            (adRequest) => adRequest.ad_request_id !== adRequestId
          );
        })
        .catch((error) => {
          console.error('Error:', error);
          alert('Failed to accept ad request.');
        });
    },
    rejectAdRequest(adRequestId) {
      fetch(`/api/sponsor/reject_ad_requests/${adRequestId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then((res) => res.json())
        .then((data) => {
          alert(data.message || 'Ad request rejected successfully');
          this.receivedAdRequests = this.receivedAdRequests.filter(
            (adRequest) => adRequest.ad_request_id !== adRequestId
          );
        })
        .catch((error) => {
          console.error('Error:', error);
          alert('Failed to reject ad request.');
        });
    },
  },
};
