const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { checkFeatureAccess } = require('../middleware/featureAccess');
const axios = require('axios');
const User = require('../models/User');

// Connect CRM
router.post('/connect', auth, checkFeatureAccess('integrations.crm'), async (req, res) => {
  try {
    const { provider, code, redirectUri } = req.body;
    
    let tokens;
    if (provider === 'salesforce') {
      tokens = await exchangeSalesforceAuthCode(code, redirectUri);
    } else if (provider === 'hubspot') {
      tokens = await exchangeHubSpotAuthCode(code, redirectUri);
    } else {
      return res.status(400).json({ error: 'Unsupported CRM provider' });
    }
    
    // Update user with CRM integration
    req.user.integrations.crm = {
      provider,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      connectedAt: new Date()
    };
    
    await req.user.save();
    
    res.json({ 
      success: true, 
      message: `${provider.charAt(0).toUpperCase() + provider.slice(1)} connected successfully` 
    });
  } catch (error) {
    console.error('CRM connect error:', error);
    res.status(500).json({ error: 'Failed to connect CRM' });
  }
});

// Disconnect CRM
router.post('/disconnect', auth, async (req, res) => {
  try {
    req.user.integrations.crm = null;
    await req.user.save();
    
    res.json({ success: true, message: 'CRM disconnected' });
  } catch (error) {
    console.error('CRM disconnect error:', error);
    res.status(500).json({ error: 'Failed to disconnect CRM' });
  }
});

// Get CRM deals
router.get('/deals', auth, async (req, res) => {
  try {
    const { provider, accessToken } = req.user.integrations.crm || {};
    
    if (!provider || !accessToken) {
      return res.status(400).json({ error: 'CRM not connected' });
    }
    
    let deals;
    if (provider === 'salesforce') {
      deals = await fetchSalesforceDeals(accessToken);
    } else if (provider === 'hubspot') {
      deals = await fetchHubSpotDeals(accessToken);
    } else {
      return res.status(400).json({ error: 'Unsupported CRM provider' });
    }
    
    res.json(deals);
  } catch (error) {
    console.error('CRM deals fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch deals' });
  }
});

// Search deals by email
router.get('/deals/search', auth, async (req, res) => {
  try {
    const { email } = req.query;
    const { provider, accessToken } = req.user.integrations.crm || {};
    
    if (!provider || !accessToken) {
      return res.status(400).json({ error: 'CRM not connected' });
    }
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    let deals;
    if (provider === 'salesforce') {
      deals = await searchSalesforceDealsByEmail(accessToken, email);
    } else if (provider === 'hubspot') {
      deals = await searchHubSpotDealsByEmail(accessToken, email);
    }
    
    res.json(deals || []);
  } catch (error) {
    console.error('CRM search error:', error);
    res.status(500).json({ error: 'Failed to search deals' });
  }
});

// Helper functions
async function exchangeSalesforceAuthCode(code, redirectUri) {
  const response = await axios.post('https://login.salesforce.com/services/oauth2/token', null, {
    params: {
      grant_type: 'authorization_code',
      code,
      client_id: process.env.SALESFORCE_CLIENT_ID,
      client_secret: process.env.SALESFORCE_CLIENT_SECRET,
      redirect_uri: redirectUri
    }
  });
  
  return response.data;
}

async function exchangeHubSpotAuthCode(code, redirectUri) {
  const response = await axios.post('https://api.hubapi.com/oauth/v1/token', null, {
    params: {
      grant_type: 'authorization_code',
      code,
      client_id: process.env.HUBSPOT_CLIENT_ID,
      client_secret: process.env.HUBSPOT_CLIENT_SECRET,
      redirect_uri: redirectUri
    }
  });
  
  return response.data;
}

async function fetchSalesforceDeals(accessToken) {
  const response = await axios.get(
    `${process.env.SALESFORCE_INSTANCE_URL}/services/data/v58.0/query`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: {
        q: `SELECT Id, Name, Amount, StageName, CloseDate, Next_Steps__c, 
            Account.Name, Contact.Name, Contact.Email 
            FROM Opportunity 
            WHERE IsClosed = false 
            ORDER BY CreatedDate DESC 
            LIMIT 50`
      }
    }
  );
  
  return response.data.records.map(deal => ({
    id: deal.Id,
    name: deal.Name,
    amount: deal.Amount,
    stage: deal.StageName,
    closeDate: deal.CloseDate,
    nextSteps: deal.Next_Steps__c,
    accountName: deal.Account?.Name,
    contactName: deal.Contact?.Name,
    contactEmail: deal.Contact?.Email
  }));
}

async function fetchHubSpotDeals(accessToken) {
  const response = await axios.get(
    'https://api.hubapi.com/crm/v3/objects/deals',
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: {
        limit: 50,
        properties: ['dealname', 'amount', 'dealstage', 'closedate', 'hs_next_step'],
        associations: ['contacts', 'companies']
      }
    }
  );
  
  return response.data.results.map(deal => ({
    id: deal.id,
    name: deal.properties.dealname,
    amount: deal.properties.amount,
    stage: deal.properties.dealstage,
    closeDate: deal.properties.closedate,
    nextSteps: deal.properties.hs_next_step
  }));
}

async function searchSalesforceDealsByEmail(accessToken, email) {
  const response = await axios.get(
    `${process.env.SALESFORCE_INSTANCE_URL}/services/data/v58.0/query`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: {
        q: `SELECT Id, Name, StageName, CloseDate, Next_Steps__c, 
            Account.Name 
            FROM Opportunity 
            WHERE Contact.Email = '${email}' 
            AND IsClosed = false 
            ORDER BY CreatedDate DESC`
      }
    }
  );
  
  return response.data.records;
}

async function searchHubSpotDealsByEmail(accessToken, email) {
  // First find contact by email
  const contactResponse = await axios.get(
    `https://api.hubapi.com/crm/v3/objects/contacts/search`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: {
        filterGroups: [{
          filters: [{
            propertyName: 'email',
            operator: 'EQ',
            value: email
          }]
        }]
      }
    }
  );
  
  if (!contactResponse.data.results?.length) return [];
  
  const contactId = contactResponse.data.results[0].id;
  
  // Then find deals associated with this contact
  const dealsResponse = await axios.get(
    `https://api.hubapi.com/crm/v3/objects/deals`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: {
        associations: 'contacts',
        limit: 10
      }
    }
  );
  
  return dealsResponse.data.results.filter(deal => 
    deal.associations?.contacts?.results?.includes(contactId)
  );
}

module.exports = router;