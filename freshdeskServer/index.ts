import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import axios from "axios";

// Create an MCP server for FreshDesk API integration
const server = new McpServer({
  name: "FreshWorks API Client",
  version: "1.0.0"
});

// Common error handling utility
const handleApiError = (error: any) => {
  if (error.response) {
    const { status, data } = error.response;
    return `API Error (${status}): ${JSON.stringify(data)}`;
  }
  return `Error: ${error.message || "Unknown error"}`;
};

// Helper function to create an authenticated API client
const createApiClient = (apiKey: string, baseUrl: string) => {
  return axios.create({
    baseURL: baseUrl,
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    }
  });
};

// -------------------------------------------------- Tools -------------------------------------------------------
// List tickets tool
server.tool(
  "freshdesk-list-tickets",
  {
    apiKey: z.string().describe("FreshDesk API key"),
    subdomain: z.string().describe("Your FreshDesk subdomain (example: your-company)"),
    page: z.number().optional().default(1).describe("Page number for pagination"),
    perPage: z.number().optional().default(30).describe("Number of results per page"),
    filter: z.string().optional().describe("Filter query (e.g. 'status:2' for open tickets)")
  },
  async ({ apiKey, subdomain, page, perPage, filter }) => {
    try {
      const client = createApiClient(apiKey, `https://${subdomain}.freshdesk.com/api/v2`);
      
      const params: Record<string, any> = {
        page,
        per_page: perPage
      };
      
      if (filter) {
        params.filter = filter;
      }
      
      const response = await client.get('/tickets', { params });
      
      return {
        content: [{ 
          type: "text", 
          text: JSON.stringify(response.data, null, 2)
        }]
      };
    } catch (error: any) {
      return {
        content: [{ type: "text", text: handleApiError(error) }],
        isError: true
      };
    }
  }
);

// Get ticket details tool
server.tool(
  "freshdesk-get-ticket",
  {
    apiKey: z.string().describe("FreshDesk API key"),
    subdomain: z.string().describe("Your FreshDesk subdomain"),
    ticketId: z.number().describe("Ticket ID to retrieve")
  },
  async ({ apiKey, subdomain, ticketId }) => {
    try {
      const client = createApiClient(apiKey, `https://${subdomain}.freshdesk.com/api/v2`);
      const response = await client.get(`/tickets/${ticketId}`);
      
      return {
        content: [{ 
          type: "text", 
          text: JSON.stringify(response.data, null, 2)
        }]
      };
    } catch (error: any) {
      return {
        content: [{ type: "text", text: handleApiError(error) }],
        isError: true
      };
    }
  }
);

// Create ticket tool
server.tool(
  "freshdesk-create-ticket",
  {
    apiKey: z.string().describe("FreshDesk API key"),
    subdomain: z.string().describe("Your FreshDesk subdomain"),
    subject: z.string().describe("Ticket subject"),
    description: z.string().describe("Ticket description"),
    email: z.string().email().describe("Requester email"),
    priority: z.number().min(1).max(4).default(2).describe("Priority: 1 (Low) to 4 (Urgent)"),
    status: z.number().min(2).max(5).default(2).describe("Status: 2 (Open), 3 (Pending), 4 (Resolved), 5 (Closed)"),
    tags: z.array(z.string()).optional().describe("Tags for the ticket")
  },
  async ({ apiKey, subdomain, subject, description, email, priority, status, tags }) => {
    try {
      const client = createApiClient(apiKey, `https://${subdomain}.freshdesk.com/api/v2`);
      
      const payload = {
        subject,
        description,
        email,
        priority,
        status,
        tags
      };
      
      const response = await client.post('/tickets', payload);
      
      return {
        content: [{ 
          type: "text", 
          text: `Ticket created successfully with ID: ${response.data.id}\n\n${JSON.stringify(response.data, null, 2)}`
        }]
      };
    } catch (error: any) {
      return {
        content: [{ type: "text", text: handleApiError(error) }],
        isError: true
      };
    }
  }
);

// Update ticket tool
server.tool(
  "freshdesk-update-ticket",
  {
    apiKey: z.string().describe("FreshDesk API key"),
    subdomain: z.string().describe("Your FreshDesk subdomain"),
    ticketId: z.number().describe("Ticket ID to update"),
    subject: z.string().optional().describe("Updated ticket subject"),
    description: z.string().optional().describe("Updated ticket description"),
    priority: z.number().min(1).max(4).optional().describe("Priority: 1 (Low) to 4 (Urgent)"),
    status: z.number().min(2).max(5).optional().describe("Status: 2 (Open), 3 (Pending), 4 (Resolved), 5 (Closed)"),
    tags: z.array(z.string()).optional().describe("Updated tags for the ticket")
  },
  async ({ apiKey, subdomain, ticketId, ...updateData }) => {
    try {
      const client = createApiClient(apiKey, `https://${subdomain}.freshdesk.com/api/v2`);
      
      // Only include fields that were provided
      const payload: Record<string, any> = {};
      Object.entries(updateData).forEach(([key, value]) => {
        if (value !== undefined) {
          payload[key] = value;
        }
      });
      
      const response = await client.put(`/tickets/${ticketId}`, payload);
      
      return {
        content: [{ 
          type: "text", 
          text: `Ticket ${ticketId} updated successfully\n\n${JSON.stringify(response.data, null, 2)}`
        }]
      };
    } catch (error: any) {
      return {
        content: [{ type: "text", text: handleApiError(error) }],
        isError: true
      };
    }
  }
);

// Add ticket note tool
server.tool(
  "freshdesk-add-note",
  {
    apiKey: z.string().describe("FreshDesk API key"),
    subdomain: z.string().describe("Your FreshDesk subdomain"),
    ticketId: z.number().describe("Ticket ID to add note to"),
    body: z.string().describe("Content of the note"),
    isPrivate: z.boolean().default(true).describe("Whether this note is private (only visible to agents)")
  },
  async ({ apiKey, subdomain, ticketId, body, isPrivate }) => {
    try {
      const client = createApiClient(apiKey, `https://${subdomain}.freshdesk.com/api/v2`);
      
      const payload = {
        body,
        private: isPrivate
      };
      
      const response = await client.post(`/tickets/${ticketId}/notes`, payload);
      
      return {
        content: [{ 
          type: "text", 
          text: `Note added successfully to ticket ${ticketId}\n\n${JSON.stringify(response.data, null, 2)}`
        }]
      };
    } catch (error: any) {
      return {
        content: [{ type: "text", text: handleApiError(error) }],
        isError: true
      };
    }
  }
);

// List contacts tool
server.tool(
  "freshdesk-list-contacts",
  {
    apiKey: z.string().describe("FreshDesk API key"),
    subdomain: z.string().describe("Your FreshDesk subdomain"),
    page: z.number().optional().default(1).describe("Page number for pagination"),
    perPage: z.number().optional().default(30).describe("Number of results per page")
  },
  async ({ apiKey, subdomain, page, perPage }) => {
    try {
      const client = createApiClient(apiKey, `https://${subdomain}.freshdesk.com/api/v2`);
      
      const params = {
        page,
        per_page: perPage
      };
      
      const response = await client.get('/contacts', { params });
      
      return {
        content: [{ 
          type: "text", 
          text: JSON.stringify(response.data, null, 2)
        }]
      };
    } catch (error: any) {
      return {
        content: [{ type: "text", text: handleApiError(error) }],
        isError: true
      };
    }
  }
);

// Get contact details tool
server.tool(
  "freshdesk-get-contact",
  {
    apiKey: z.string().describe("FreshDesk API key"),
    subdomain: z.string().describe("Your FreshDesk subdomain"),
    contactId: z.number().describe("Contact ID to retrieve")
  },
  async ({ apiKey, subdomain, contactId }) => {
    try {
      const client = createApiClient(apiKey, `https://${subdomain}.freshdesk.com/api/v2`);
      const response = await client.get(`/contacts/${contactId}`);
      
      return {
        content: [{ 
          type: "text", 
          text: JSON.stringify(response.data, null, 2)
        }]
      };
    } catch (error: any) {
      return {
        content: [{ type: "text", text: handleApiError(error) }],
        isError: true
      };
    }
  }
);

// Create contact tool
server.tool(
  "freshdesk-create-contact",
  {
    apiKey: z.string().describe("FreshDesk API key"),
    subdomain: z.string().describe("Your FreshDesk subdomain"),
    name: z.string().describe("Contact's name"),
    email: z.string().email().describe("Contact's email"),
    phone: z.string().optional().describe("Contact's phone number"),
    mobilePhone: z.string().optional().describe("Contact's mobile phone"),
    twitterId: z.string().optional().describe("Contact's Twitter ID"),
    companyName: z.string().optional().describe("Company name of the contact"),
    description: z.string().optional().describe("Description about the contact")
  },
  async ({ apiKey, subdomain, name, email, phone, mobilePhone, twitterId, companyName, description }) => {
    try {
      const client = createApiClient(apiKey, `https://${subdomain}.freshdesk.com/api/v2`);
      
      const payload: Record<string, any> = {
        name,
        email
      };
      
      if (phone) payload.phone = phone;
      if (mobilePhone) payload.mobile = mobilePhone;
      if (twitterId) payload.twitter_id = twitterId;
      if (description) payload.description = description;
      
      // Handle company if provided
      if (companyName) {
        payload.company_id = null; // We'll set this to null initially as we're using company name
        payload.other_companies = [{ name: companyName }];
      }
      
      const response = await client.post('/contacts', payload);
      
      return {
        content: [{ 
          type: "text", 
          text: `Contact created successfully with ID: ${response.data.id}\n\n${JSON.stringify(response.data, null, 2)}`
        }]
      };
    } catch (error: any) {
      return {
        content: [{ type: "text", text: handleApiError(error) }],
        isError: true
      };
    }
  }
);

// Update contact tool
server.tool(
  "freshdesk-update-contact",
  {
    apiKey: z.string().describe("FreshDesk API key"),
    subdomain: z.string().describe("Your FreshDesk subdomain"),
    contactId: z.number().describe("Contact ID to update"),
    name: z.string().optional().describe("Contact's updated name"),
    email: z.string().email().optional().describe("Contact's updated email"),
    phone: z.string().optional().describe("Contact's updated phone number"),
    mobilePhone: z.string().optional().describe("Contact's updated mobile phone"),
    twitterId: z.string().optional().describe("Contact's updated Twitter ID"),
    description: z.string().optional().describe("Updated description about the contact")
  },
  async ({ apiKey, subdomain, contactId, name, email, phone, mobilePhone, twitterId, description }) => {
    try {
      const client = createApiClient(apiKey, `https://${subdomain}.freshdesk.com/api/v2`);
      
      const payload: Record<string, any> = {};
      if (name) payload.name = name;
      if (email) payload.email = email;
      if (phone) payload.phone = phone;
      if (mobilePhone) payload.mobile = mobilePhone;
      if (twitterId) payload.twitter_id = twitterId;
      if (description) payload.description = description;
      
      const response = await client.put(`/contacts/${contactId}`, payload);
      
      return {
        content: [{ 
          type: "text", 
          text: `Contact ${contactId} updated successfully\n\n${JSON.stringify(response.data, null, 2)}`
        }]
      };
    } catch (error: any) {
      return {
        content: [{ type: "text", text: handleApiError(error) }],
        isError: true
      };
    }
  }
);

// List conversations tool
server.tool(
  "freshchat-list-conversations",
  {
    apiKey: z.string().describe("FreshChat API key"),
    domain: z.string().describe("Your FreshChat domain (e.g., api.freshchat.com)"),
    assigneeId: z.string().optional().describe("Filter by assignee ID"),
    status: z.enum(["new", "assigned", "resolved", "closed"]).optional().describe("Filter by conversation status"),
    page: z.number().optional().default(1).describe("Page number for pagination"),
    itemsPerPage: z.number().optional().default(20).describe("Number of results per page")
  },
  async ({ apiKey, domain, assigneeId, status, page, itemsPerPage }) => {
    try {
      const client = createApiClient(apiKey, `https://${domain}/v2`);
      
      const params: Record<string, any> = {
        page,
        items_per_page: itemsPerPage
      };
      
      if (assigneeId) params.assignee_id = assigneeId;
      if (status) params.status = status;
      
      const response = await client.get('/conversations', { params });
      
      return {
        content: [{ 
          type: "text", 
          text: JSON.stringify(response.data, null, 2)
        }]
      };
    } catch (error: any) {
      return {
        content: [{ type: "text", text: handleApiError(error) }],
        isError: true
      };
    }
  }
);

// Get conversation details tool
server.tool(
  "freshchat-get-conversation",
  {
    apiKey: z.string().describe("FreshChat API key"),
    domain: z.string().describe("Your FreshChat domain (e.g., api.freshchat.com)"),
    conversationId: z.string().describe("Conversation ID to retrieve")
  },
  async ({ apiKey, domain, conversationId }) => {
    try {
      const client = createApiClient(apiKey, `https://${domain}/v2`);
      const response = await client.get(`/conversations/${conversationId}`);
      
      return {
        content: [{ 
          type: "text", 
          text: JSON.stringify(response.data, null, 2)
        }]
      };
    } catch (error: any) {
      return {
        content: [{ type: "text", text: handleApiError(error) }],
        isError: true
      };
    }
  }
);

// Send message to conversation tool
server.tool(
  "freshchat-send-message",
  {
    apiKey: z.string().describe("FreshChat API key"),
    domain: z.string().describe("Your FreshChat domain (e.g., api.freshchat.com)"),
    conversationId: z.string().describe("Conversation ID to send message to"),
    actorType: z.enum(["agent", "system"]).default("agent").describe("Type of sender"),
    actorId: z.string().describe("ID of the agent or system sending the message"),
    message: z.string().describe("Message content to send"),
    messageType: z.enum(["normal", "private"]).default("normal").describe("Type of message")
  },
  async ({ apiKey, domain, conversationId, actorType, actorId, message, messageType }) => {
    try {
      const client = createApiClient(apiKey, `https://${domain}/v2`);
      
      const payload = {
        actor_type: actorType,
        actor_id: actorId,
        message_type: messageType,
        message: {
          type: "text",
          text: message
        }
      };
      
      const response = await client.post(`/conversations/${conversationId}/messages`, payload);
      
      return {
        content: [{ 
          type: "text", 
          text: `Message sent successfully to conversation ${conversationId}\n\n${JSON.stringify(response.data, null, 2)}`
        }]
      };
    } catch (error: any) {
      return {
        content: [{ type: "text", text: handleApiError(error) }],
        isError: true
      };
    }
  }
);

// Start the server with stdio transport
const startServer = async () => {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.log("FreshWorks API MCP server is running...");
};

startServer().catch(console.error);