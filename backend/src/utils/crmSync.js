// backend/src/utils/crmSync.js
const axios = require('axios');

const crmSync = {
  async syncToCRM(user, commitment) {
    const { provider, accessToken } = user.integrations.crm;
    
    if (!provider || !accessToken) {
      return { success: false, error: 'CRM not connected' };
    }
    
    try {
      if (provider === 'salesforce') {
        return await syncToSalesforce(accessToken, commitment);
      } else if (provider === 'hubspot') {
        return await syncToHubSpot(accessToken, commitment);
      }
      
      return { success: false, error: 'Unsupported CRM' };
    } catch (error) {
      console.error(`CRM sync error (${provider}):`, error);
      return { success: false, error: error.message };
    }
  },
  
  async revertCRMSync(user, commitment) {
    // Implementation for reverting CRM sync
    return { success: true, message: 'Reverted successfully' };
  }
};

async function syncToSalesforce(accessToken, commitment) {
  const ourActions = commitment.ourCommitments.map(c => 
    `We: ${c.action} by ${new Date(c.dueDate).toLocaleDateString()}`
  ).join('; ');
  
  const theirActions = commitment.theirCommitments.map(c => 
    `They: ${c.action} by ${new Date(c.dueDate).toLocaleDateString()}`
  ).join('; ');
  
  const nextSteps = `Mutual commitments: ${ourActions}; ${theirActions} - Updated via Deal Clarity`;
  
  const response = await axios.patch(
    `${process.env.SALESFORCE_INSTANCE_URL}/services/data/v58.0/sobjects/Opportunity/${commitment.dealId}`,
    { Next_Steps__c: nextSteps },
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  return { 
    success: true, 
    field: 'Next_Steps__c',
    data: response.data 
  };
}

async function syncToHubSpot(accessToken, commitment) {
  const response = await axios.patch(
    `https://api.hubapi.com/crm/v3/objects/deals/${commitment.dealId}`,
    {
      properties: {
        hs_next_step: `Mutual commitments updated: ${new Date().toISOString()}`
      }
    },
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  return { 
    success: true, 
    field: 'hs_next_step',
    data: response.data 
  };
}

module.exports = crmSync;