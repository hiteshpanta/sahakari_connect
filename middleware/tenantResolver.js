const CooperativeProfile = require('../models/CooperativeProfile');
const Cooperative = require('../models/Cooperative');

const tenantResolver = async (req, res, next) => {
  try {
    let tenantDomain = req.headers['x-tenant-domain'] || req.headers.host;
    
    // For local testing, we might want to pass a specific tenant ID header
    const tenantIdHeader = req.headers['x-tenant-id'];
    
    let profile;

    if (tenantIdHeader) {
      profile = await CooperativeProfile.findOne({ cooperativeId: tenantIdHeader });
    } else {
      // Clean up the domain (remove port if exists)
      const hostParts = tenantDomain.split(':');
      const domain = hostParts[0];

      // Try to find by custom domain
      profile = await CooperativeProfile.findOne({ customDomain: domain });
      
      // If not found by custom domain, we might need a subdomain logic here.
      // For simplicity, if they use a custom domain, it should be in the DB.
      // E.g. 'coop1.example.com' could be set as customDomain.
    }

    if (!profile && !req.path.startsWith('/api/public')) {
       // Allow some public routes or platform admin routes to pass without a tenant,
       // but for now let's just warn or return 404 if it's a tenant-specific route.
       // We can just set req.tenant = null and handle it in specific controllers.
       req.tenant = null;
    } else {
       req.tenant = profile;
       req.cooperativeId = profile ? profile.cooperativeId : null;
    }

    next();
  } catch (error) {
    console.error('Tenant Resolution Error:', error);
    res.status(500).json({ success: false, message: 'Server error during tenant resolution' });
  }
};

module.exports = tenantResolver;
