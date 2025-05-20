import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import fetch from "node-fetch";

// Create an MCP server
const server = new McpServer({
  name: "Hubspot API Server",
  version: "1.0.0",
  description: "MCP server exposing Hubspot API tools"
});

// ---------------------------------------------- Tools ----------------------------------------------
// Tool to get Hubspot contacts
server.tool(
  "hubspot-list-contacts",
  { 
    apiKey: z.string().describe("Hubspot API key"), 
    limit: z.number().optional().default(10).describe("Number of contacts to return"),
    properties: z.array(z.string()).optional().default(["email", "firstname", "lastname"]).describe("Contact properties to return")
  },
  async ({ apiKey, limit, properties }) => {
    try {
      const propertiesQuery = properties.map(p => `properties=${encodeURIComponent(p)}`).join('&');
      const response = await fetch(
        `https://api.hubapi.com/crm/v3/objects/contacts?limit=${limit}&${propertiesQuery}`,
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        return {
          content: [{ 
            type: "text", 
            text: `Error fetching Hubspot contacts: ${response.status} ${response.statusText}\n${errorText}`
          }],
          isError: true
        };
      }
      
      const data = await response.json();
      return {
        content: [{ 
          type: "text", 
          text: JSON.stringify(data, null, 2)
        }]
      };
    } catch (error) {
      return {
        content: [{ 
          type: "text", 
          text: `Error fetching Hubspot contacts: ${error instanceof Error ? error.message : String(error)}`
        }],
        isError: true
      };
    }
  }
);

// Tool to get Hubspot contact by ID
server.tool(
  "hubspot-get-contact",
  { 
    apiKey: z.string().describe("Hubspot API key"), 
    contactId: z.string().describe("Contact ID"),
    properties: z.array(z.string()).optional().default(["email", "firstname", "lastname"]).describe("Contact properties to return")
  },
  async ({ apiKey, contactId, properties }) => {
    try {
      const propertiesQuery = properties.map(p => `properties=${encodeURIComponent(p)}`).join('&');
      const response = await fetch(
        `https://api.hubapi.com/crm/v3/objects/contacts/${contactId}?${propertiesQuery}`,
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        return {
          content: [{ 
            type: "text", 
            text: `Error fetching Hubspot contact: ${response.status} ${response.statusText}\n${errorText}`
          }],
          isError: true
        };
      }
      
      const data = await response.json();
      return {
        content: [{ 
          type: "text", 
          text: JSON.stringify(data, null, 2)
        }]
      };
    } catch (error) {
      return {
        content: [{ 
          type: "text", 
          text: `Error fetching Hubspot contact: ${error instanceof Error ? error.message : String(error)}`
        }],
        isError: true
      };
    }
  }
);

// Tool to create Hubspot contact
server.tool(
  "hubspot-create-contact",
  { 
    apiKey: z.string().describe("Hubspot API key"), 
    properties: z.record(z.string()).describe("Contact properties (e.g. email, firstname, lastname)")
  },
  async ({ apiKey, properties }) => {
    try {
      const response = await fetch(
        "https://api.hubapi.com/crm/v3/objects/contacts",
        {
          method: "POST",
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ properties })
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        return {
          content: [{ 
            type: "text", 
            text: `Error creating Hubspot contact: ${response.status} ${response.statusText}\n${errorText}`
          }],
          isError: true
        };
      }
      
      const data = await response.json();
      return {
        content: [{ 
          type: "text", 
          text: JSON.stringify(data, null, 2)
        }]
      };
    } catch (error) {
      return {
        content: [{ 
          type: "text", 
          text: `Error creating Hubspot contact: ${error instanceof Error ? error.message : String(error)}`
        }],
        isError: true
      };
    }
  }
);

// Tool to update Hubspot contact
server.tool(
  "hubspot-update-contact",
  { 
    apiKey: z.string().describe("Hubspot API key"),
    contactId: z.string().describe("Contact ID"), 
    properties: z.record(z.string()).describe("Contact properties to update")
  },
  async ({ apiKey, contactId, properties }) => {
    try {
      const response = await fetch(
        `https://api.hubapi.com/crm/v3/objects/contacts/${contactId}`,
        {
          method: "PATCH",
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ properties })
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        return {
          content: [{ 
            type: "text", 
            text: `Error updating Hubspot contact: ${response.status} ${response.statusText}\n${errorText}`
          }],
          isError: true
        };
      }
      
      const data = await response.json();
      return {
        content: [{ 
          type: "text", 
          text: JSON.stringify(data, null, 2)
        }]
      };
    } catch (error) {
      return {
        content: [{ 
          type: "text", 
          text: `Error updating Hubspot contact: ${error instanceof Error ? error.message : String(error)}`
        }],
        isError: true
      };
    }
  }
);

// Tool to search Hubspot contacts
server.tool(
  "hubspot-search-contacts",
  { 
    apiKey: z.string().describe("Hubspot API key"),
    query: z.string().describe("Search query"), 
    limit: z.number().optional().default(10).describe("Number of contacts to return"),
    properties: z.array(z.string()).optional().default(["email", "firstname", "lastname"]).describe("Contact properties to return")
  },
  async ({ apiKey, query, limit, properties }) => {
    try {
      const response = await fetch(
        "https://api.hubapi.com/crm/v3/objects/contacts/search",
        {
          method: "POST",
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            filterGroups: [
              {
                filters: [
                  {
                    propertyName: "email",
                    operator: "CONTAINS_TOKEN",
                    value: query
                  }
                ]
              }
            ],
            properties,
            limit
          })
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        return {
          content: [{ 
            type: "text", 
            text: `Error searching Hubspot contacts: ${response.status} ${response.statusText}\n${errorText}`
          }],
          isError: true
        };
      }
      
      const data = await response.json();
      return {
        content: [{ 
          type: "text", 
          text: JSON.stringify(data, null, 2)
        }]
      };
    } catch (error) {
      return {
        content: [{ 
          type: "text", 
          text: `Error searching Hubspot contacts: ${error instanceof Error ? error.message : String(error)}`
        }],
        isError: true
      };
    }
  }
);

// Tool to list Hubspot deals
server.tool(
  "hubspot-list-deals",
  { 
    apiKey: z.string().describe("Hubspot API key"), 
    limit: z.number().optional().default(10).describe("Number of deals to return"),
    properties: z.array(z.string()).optional().default(["dealname", "amount", "dealstage"]).describe("Deal properties to return")
  },
  async ({ apiKey, limit, properties }) => {
    try {
      const propertiesQuery = properties.map(p => `properties=${encodeURIComponent(p)}`).join('&');
      const response = await fetch(
        `https://api.hubapi.com/crm/v3/objects/deals?limit=${limit}&${propertiesQuery}`,
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        return {
          content: [{ 
            type: "text", 
            text: `Error fetching Hubspot deals: ${response.status} ${response.statusText}\n${errorText}`
          }],
          isError: true
        };
      }
      
      const data = await response.json();
      return {
        content: [{ 
          type: "text", 
          text: JSON.stringify(data, null, 2)
        }]
      };
    } catch (error) {
      return {
        content: [{ 
          type: "text", 
          text: `Error fetching Hubspot deals: ${error instanceof Error ? error.message : String(error)}`
        }],
        isError: true
      };
    }
  }
);

// Run the server
async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Google Maps MCP Server running on stdio");
}

runServer().catch((error) => {
  console.error("Fatal error running server:", error);
  process.exit(1);
});