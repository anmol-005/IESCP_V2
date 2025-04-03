// export default {
//   name: "ManageAdRequests",
//   data() {
//     return {
//       createdAdRequests: [],
//       adRequests: [],
//       completedAdRequests: [],
//       expiredAdRequests: [],
//       errorMessage: "",
//       sponsorStatus: "", // To store the current user's status
//     };
//   },
//   mounted() {
//     this.fetchAdRequests();
//   },
//   methods: {
//     async fetchAdRequests() {
//       try {
//         const response = await fetch("/api/ad_requests");
//         if (!response.ok) {
//           throw new Error("Failed to fetch ad requests");
//         }
//         const data = await response.json();
//         this.createdAdRequests = data.created_ad_requests;
//         this.adRequests = data.ad_requests;
//         this.completedAdRequests = data.completed_ad_requests;
//         this.expiredAdRequests = data.expired_ad_requests;
//       } catch (error) {
//         this.errorMessage = error.message;
//       }
//     },
//     async deleteAdRequest(adRequestId) {
//       try {
//         const response = await fetch(`/api/ad_requests/${adRequestId}`, {
//           method: "DELETE",
//           credentials: "include",
//         });
    
//         if (response.ok) {
//           const data = await response.json();
//           console.log("Deleted:", data);
    
//           // Remove the deleted ad request from the relevant array
//           this.adRequests = this.adRequests.filter(ad => ad.ad_request_id !== adRequestId);
//           this.createdAdRequests = this.createdAdRequests.filter(ad => ad.ad_request_id !== adRequestId);
//           this.completedAdRequests = this.completedAdRequests.filter(ad => ad.ad_request_id !== adRequestId);
//           this.expiredAdRequests = this.expiredAdRequests.filter(ad => ad.ad_request_id !== adRequestId);
    
//           return data;
//         } else {
//           console.error("Failed to delete ad request");
//           return null;
//         }
//       } catch (error) {
//         console.error("Error:", error.message);
//       }
//     },
//   },
//   template: `
//     <div class="container">
//       <h2>Manage Ad Requests</h2>
//       <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>

//       <section>
//         <div class="mb-3">
//           <button class="btn btn-primary mr-2" @click="$router.push('/create_public_ad_request')">
//             Create Public Ad Request
//           </button>
//           <button class="btn btn-secondary" @click="$router.push('/create_private_ad_request')">
//             Create Private Ad Request
//           </button>
//         </div>
//       </section>

//       <!-- Created Ad Requests -->
//       <section>
//         <h3>Created Ad Requests</h3>
//         <table v-if="createdAdRequests.length" class="table table-striped">
//           <thead>
//             <tr>
//               <th>Campaign Name</th>
//               <th>Requirements</th>
//               <th>Status</th>
//               <th>Payment Amount</th>
//               <th>Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             <tr v-for="ad in createdAdRequests" :key="ad.ad_request_id">
//               <td>{{ ad.campaign_name }}</td>
//               <td>{{ ad.requirements }}</td>
//               <td>{{ ad.status }}</td>
//               <td>{{ ad.payment_amount }}</td>
//               <td>
//                 <button class="btn btn-warning btn-sm" @click="$router.push({ name: 'UpdateAdRequest', params: { adRequestId: ad.ad_request_id } })">Update</button>
//                 <button class="btn btn-danger btn-sm" @click="deleteAdRequest(ad.ad_request_id)">Delete</button>
//               </td>
//             </tr>
//           </tbody>
//         </table>
//         <p v-else>No created ad requests.</p>
//       </section>

//       <!-- Existing Ad Requests -->
//       <section>
//         <h3>Existing Ad Requests</h3>
//         <table v-if="adRequests.length" class="table table-striped">
//           <thead>
//             <tr>
//               <th>Campaign Name</th>
//               <th>Influencer Name</th>
//               <th>Requirements</th>
//               <th>Status</th>
//               <th>Payment Amount</th>
//             </tr>
//           </thead>
//           <tbody>
//             <tr v-for="ad in adRequests" :key="ad.ad_request_id">
//               <td>{{ ad.campaign_name }}</td>
//               <td>{{ ad.influencer_name }}</td>
//               <td>{{ ad.requirements }}</td>
//               <td>{{ ad.status }}</td>
//               <td>{{ ad.payment_amount }}</td>
//             </tr>
//           </tbody>
//         </table>
//         <p v-else>No ad requests.</p>
//       </section>

//       <!-- Completed Ad Requests -->
//       <section>
//         <h3>Completed Ad Requests</h3>
//         <table v-if="completedAdRequests.length" class="table table-striped">
//           <thead>
//             <tr>
//               <th>Campaign Name</th>
//               <th>Influencer Name</th>
//               <th>Requirements</th>
//               <th>Payment Amount</th>
//               <th>Verification Link</th>
//               <th>Status</th>
//             </tr>
//           </thead>
//           <tbody>
//             <tr v-for="ad in completedAdRequests" :key="ad.ad_request_id">
//               <td>{{ ad.campaign_name }}</td>
//               <td>{{ ad.influencer_name }}</td>
//               <td>{{ ad.requirements }}</td>
//               <td>{{ ad.payment_amount }}</td>
//               <td>
//                 <a v-if="ad.verification_link" :href="ad.verification_link" target="_blank">View</a>
//                 <span v-else>No link provided</span>
//               </td>
//               <td>{{ ad.status }}</td>
//             </tr>
//           </tbody>
//         </table>
//         <p v-else>No completed ad requests.</p>
//       </section>

//       <!-- Expired Ad Requests -->
//       <section>
//         <h3>Expired Ad Requests</h3>
//         <table v-if="expiredAdRequests.length" class="table table-striped">
//           <thead>
//             <tr>
//               <th>Campaign Name</th>
//               <th>Requirements</th>
//               <th>Status</th>
//               <th>Payment Amount</th>
//             </tr>
//           </thead>
//           <tbody>
//             <tr v-for="ad in expiredAdRequests" :key="ad.ad_request_id">
//               <td>{{ ad.campaign_name }}</td>
//               <td>{{ ad.requirements }}</td>
//               <td>{{ ad.status }}</td>
//               <td>{{ ad.payment_amount }}</td>
//             </tr>
//           </tbody>
//         </table>
//         <p v-else>No expired ad requests.</p>
//       </section>
//     </div>
//   `,
// };



export default {
  name: "ManageAdRequests",
  data() {
    return {
      createdAdRequests: [],
      adRequests: [],
      completedAdRequests: [],
      expiredAdRequests: [],
      errorMessage: "",
      sponsorStatus: "", // To store the sponsor's status
      sponsorRole: "",   // To store the user's role
      isAdRequestAllowed: true, // To track if ad request creation is allowed
    };
  },
  mounted() {
    this.checkUserStatus();
    this.fetchAdRequests();
  },
  methods: {
    async checkUserStatus() {
      try {
        const response = await fetch("/api/user");
        if (!response.ok) {
          throw new Error("Failed to fetch user status.");
        }
        const data = await response.json();
        this.sponsorStatus = data.status;
        this.sponsorRole = data.role;
        this.sponsorFlagged = data.flagged;
        if (
          this.sponsorRole === "sponsor" &&
          (this.sponsorStatus === "pending" || this.sponsorFlagged == true)
        ) {
          this.isAdRequestAllowed = false;
        }
      } catch (error) {
        this.errorMessage = error.message;
      }
    },
    async fetchAdRequests() {
      try {
        const response = await fetch("/api/ad_requests");
        if (!response.ok) {
          throw new Error("Failed to fetch ad requests");
        }
        const data = await response.json();
        this.createdAdRequests = data.created_ad_requests;
        this.adRequests = data.ad_requests;
        this.completedAdRequests = data.completed_ad_requests;
        this.expiredAdRequests = data.expired_ad_requests;
      } catch (error) {
        this.errorMessage = error.message;
      }
    },
    async deleteAdRequest(adRequestId) {
      try {
        const response = await fetch(`/api/ad_requests/${adRequestId}`, {
          method: "DELETE",
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          this.createdAdRequests = this.createdAdRequests.filter(
            (ad) => ad.ad_request_id !== adRequestId
          );
          this.adRequests = this.adRequests.filter(
            (ad) => ad.ad_request_id !== adRequestId
          );
          this.completedAdRequests = this.completedAdRequests.filter(
            (ad) => ad.ad_request_id !== adRequestId
          );
          this.expiredAdRequests = this.expiredAdRequests.filter(
            (ad) => ad.ad_request_id !== adRequestId
          );
        } else {
          throw new Error("Failed to delete ad request");
        }
      } catch (error) {
        this.errorMessage = error.message;
      }
    },
  },
  template: `
    <div class="container">
      <h2>Manage Ad Requests</h2>
      <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>
      <section>
        <div class="mb-3">
          <button
            class="btn btn-primary mr-2"
            @click="$router.push('/create_public_ad_request')"
            :disabled="!isAdRequestAllowed"
          >
            Create Public Ad Request
          </button>
          <button
            class="btn btn-secondary"
            @click="$router.push('/create_private_ad_request')"
            :disabled="!isAdRequestAllowed"
          >
            Create Private Ad Request
          </button>
        </div>
        <p v-if="!isAdRequestAllowed" class="text-danger">
          Your account is currently flagged or pending approval. You cannot create ad requests at this time.
        </p>
      </section>

      <!-- Created Ad Requests -->
      <section>
        <h3>Created Ad Requests</h3>
        <table v-if="createdAdRequests.length" class="table table-striped">
          <thead>
            <tr>
              <th>Campaign Name</th>
              <th>Requirements</th>
              <th>Status</th>
              <th>Payment Amount</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="ad in createdAdRequests" :key="ad.ad_request_id">
              <td>{{ ad.campaign_name }}</td>
              <td>{{ ad.requirements }}</td>
              <td>{{ ad.status }}</td>
              <td>{{ ad.payment_amount }}</td>
              <td>
                <button class="btn btn-warning btn-sm" @click="$router.push({ name: 'UpdateAdRequest', params: { adRequestId: ad.ad_request_id } })">Update</button>
                <button class="btn btn-danger btn-sm" @click="deleteAdRequest(ad.ad_request_id)">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
        <p v-else>No created ad requests.</p>
      </section>

      <!-- Existing Ad Requests -->
      <section>
        <h3>Existing Ad Requests</h3>
        <table v-if="adRequests.length" class="table table-striped">
          <thead>
            <tr>
              <th>Campaign Name</th>
              <th>Influencer Name</th>
              <th>Requirements</th>
              <th>Status</th>
              <th>Payment Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="ad in adRequests" :key="ad.ad_request_id">
              <td>{{ ad.campaign_name }}</td>
              <td>{{ ad.influencer_name }}</td>
              <td>{{ ad.requirements }}</td>
              <td>{{ ad.status }}</td>
              <td>{{ ad.payment_amount }}</td>
            </tr>
          </tbody>
        </table>
        <p v-else>No ad requests.</p>
      </section>

      <!-- Completed Ad Requests -->
      <section>
        <h3>Completed Ad Requests</h3>
        <table v-if="completedAdRequests.length" class="table table-striped">
          <thead>
            <tr>
              <th>Campaign Name</th>
              <th>Influencer Name</th>
              <th>Requirements</th>
              <th>Payment Amount</th>
              <th>Verification Link</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="ad in completedAdRequests" :key="ad.ad_request_id">
              <td>{{ ad.campaign_name }}</td>
              <td>{{ ad.influencer_name }}</td>
              <td>{{ ad.requirements }}</td>
              <td>{{ ad.payment_amount }}</td>
              <td>
                <a v-if="ad.verification_link" :href="ad.verification_link" target="_blank">View</a>
                <span v-else>No link provided</span>
              </td>
              <td>{{ ad.status }}</td>
            </tr>
          </tbody>
        </table>
        <p v-else>No completed ad requests.</p>
      </section>

      <!-- Expired Ad Requests -->
      <section>
        <h3>Expired Ad Requests</h3>
        <table v-if="expiredAdRequests.length" class="table table-striped">
          <thead>
            <tr>
              <th>Campaign Name</th>
              <th>Requirements</th>
              <th>Status</th>
              <th>Payment Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="ad in expiredAdRequests" :key="ad.ad_request_id">
              <td>{{ ad.campaign_name }}</td>
              <td>{{ ad.requirements }}</td>
              <td>{{ ad.status }}</td>
              <td>{{ ad.payment_amount }}</td>
            </tr>
          </tbody>
        </table>
        <p v-else>No expired ad requests.</p>
      </section>

    </div>
  `,
};
