// export default {
//     template: `
//         <div class="container mt-5 text-center">
//             <h1>Welcome to the Influencer Platform</h1>
//             <p>Connect with sponsors and influencers seamlessly!</p>
//             <div class="mt-4">
//                 <router-link to="/login" class="btn btn-primary me-3">Login</router-link>
//                 <router-link to="/register" class="btn btn-secondary">Register</router-link>
//             </div>
//         </div>
//     `
// };







export default {
    template: `
        <div class="landing-page">
            <div class="hero-section text-center text-white">
                <div class="container">
                    <h1 class="display-4 fw-bold">Welcome to the Influencer Platform</h1>
                    <p class="lead mt-3">Connect with sponsors and influencers seamlessly!</p>
                    <div class="mt-4">
                        <router-link to="/login" class="btn btn-lg btn-primary me-3">Login</router-link>
                        <router-link to="/register" class="btn btn-lg btn-outline-light">Register</router-link>
                    </div>
                </div>
            </div>
            <div class="info-section py-5">
                <div class="container">
                    <div class="row text-center">
                        <div class="col-md-4 mb-4">
                            <i class="fas fa-users fa-3x text-primary mb-3"></i>
                            <h3 class="h5">For Influencers</h3>
                            <p class="text-muted">Showcase your profile and attract top sponsors.</p>
                        </div>
                        <div class="col-md-4 mb-4">
                            <i class="fas fa-handshake fa-3x text-success mb-3"></i>
                            <h3 class="h5">For Sponsors</h3>
                            <p class="text-muted">Find the perfect influencers to promote your brand.</p>
                        </div>
                        <div class="col-md-4 mb-4">
                            <i class="fas fa-chart-line fa-3x text-warning mb-3"></i>
                            <h3 class="h5">Analytics</h3>
                            <p class="text-muted">Track and measure campaign performance easily.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
};

