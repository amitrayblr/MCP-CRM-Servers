import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import fetch from "node-fetch";

// Create an MCP server
const server = new McpServer({
  name: "Keap API Tools",
  version: "1.0.0",
  description: "MCP server exposing Keap API tools"
});

// ---------------------------------------------- Tools ----------------------------------------------
// Tool to get Keap contacts
server.tool(
  "keap-list-contacts",
  { 
    apiKey: z.string().describe("Keap API key"), 
    limit: z.number().optional().default(10).describe("Number of contacts to return"),
    fields: z.array(z.string()).optional().default(["email", "given_name", "family_name"]).describe("Contact fields to return")
  },
  async ({ apiKey, limit, fields }) => {
    try {
      const fieldsQuery = fields.join(',');
      const response = await fetch(
        `https://api.infusionsoft.com/crm/rest/v1/contacts?limit=${limit}&fields=${fieldsQuery}`,
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
            text: `Error fetching Keap contacts: ${response.status} ${response.statusText}\n${errorText}`
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
          text: `Error fetching Keap contacts: ${error instanceof Error ? error.message : String(error)}`
        }],
        isError: true
      };
    }
  }
);

// Tool to get Keap contact by ID
server.tool(
  "keap-get-contact",
  { 
    apiKey: z.string().describe("Keap API key"), 
    contactId: z.string().describe("Contact ID"),
    fields: z.array(z.string()).optional().default(["email", "given_name", "family_name"]).describe("Contact fields to return")
  },
  async ({ apiKey, contactId, fields }) => {
    try {
      const fieldsQuery = fields.join(',');
      const response = await fetch(
        `https://api.infusionsoft.com/crm/rest/v1/contacts/${contactId}?fields=${fieldsQuery}`,
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
            text: `Error fetching Keap contact: ${response.status} ${response.statusText}\n${errorText}`
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
          text: `Error fetching Keap contact: ${error instanceof Error ? error.message : String(error)}`
        }],
        isError: true
      };
    }
  }
);

// Tool to create Keap contact
server.tool(
  "keap-create-contact",
  { 
    apiKey: z.string().describe("Keap API key"),
    contact: z.object({
      email: z.string().optional(),
      given_name: z.string().optional(),
      family_name: z.string().optional(),
      phone_numbers: z.array(
        z.object({
          type: z.string(),
          number: z.string()
        })
      ).optional(),
      addresses: z.array(
        z.object({
          field_type: z.string(),
          line1: z.string().optional(),
          city: z.string().optional(),
          state: z.string().optional(),
          postal_code: z.string().optional(),
          country: z.string().optional()
        })
      ).optional()
    }).describe("Contact information")
  },
  async ({ apiKey, contact }) => {
    try {
      const response = await fetch(
        "https://api.infusionsoft.com/crm/rest/v1/contacts",
        {
          method: "POST",
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(contact)
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        return {
          content: [{ 
            type: "text", 
            text: `Error creating Keap contact: ${response.status} ${response.statusText}\n${errorText}`
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
          text: `Error creating Keap contact: ${error instanceof Error ? error.message : String(error)}`
        }],
        isError: true
      };
    }
  }
);

// Tool to update Keap contact
server.tool(
  "keap-update-contact",
  { 
    apiKey: z.string().describe("Keap API key"),
    contactId: z.string().describe("Contact ID"),
    contact: z.object({
      email: z.string().optional(),
      given_name: z.string().optional(),
      family_name: z.string().optional(),
      phone_numbers: z.array(
        z.object({
          type: z.string(),
          number: z.string()
        })
      ).optional(),
      addresses: z.array(
        z.object({
          field_type: z.string(),
          line1: z.string().optional(),
          city: z.string().optional(),
          state: z.string().optional(),
          postal_code: z.string().optional(),
          country: z.string().optional()
        })
      ).optional()
    }).describe("Contact information to update")
  },
  async ({ apiKey, contactId, contact }) => {
    try {
      const response = await fetch(
        `https://api.infusionsoft.com/crm/rest/v1/contacts/${contactId}`,
        {
          method: "PATCH",
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(contact)
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        return {
          content: [{ 
            type: "text", 
            text: `Error updating Keap contact: ${response.status} ${response.statusText}\n${errorText}`
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
          text: `Error updating Keap contact: ${error instanceof Error ? error.message : String(error)}`
        }],
        isError: true
      };
    }
  }
);

// Tool to search Keap contacts
server.tool(
  "keap-search-contacts",
  { 
    apiKey: z.string().describe("Keap API key"),
    query: z.string().describe("Search query"),
    limit: z.number().optional().default(10).describe("Number of contacts to return"),
    fields: z.array(z.string()).optional().default(["email", "given_name", "family_name"]).describe("Contact fields to return")
  },
  async ({ apiKey, query, limit, fields }) => {
    try {
      const fieldsQuery = fields.join(',');
      // Keap API requires email format for search
      const searchParam = query.includes('@') ? 
        `email=${encodeURIComponent(query)}` : 
        `given_name=${encodeURIComponent(query)}`;
      
      const response = await fetch(
        `https://api.infusionsoft.com/crm/rest/v1/contacts?${searchParam}&limit=${limit}&fields=${fieldsQuery}`,
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
            text: `Error searching Keap contacts: ${response.status} ${response.statusText}\n${errorText}`
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
          text: `Error searching Keap contacts: ${error instanceof Error ? error.message : String(error)}`
        }],
        isError: true
      };
    }
  }
);

// Tool to list Keap opportunities
server.tool(
  "keap-list-opportunities",
  { 
    apiKey: z.string().describe("Keap API key"),
    limit: z.number().optional().default(10).describe("Number of opportunities to return"),
    fields: z.array(z.string()).optional().default(["title", "stage", "contact", "estimated_close_date"]).describe("Opportunity fields to return") 
  },
  async ({ apiKey, limit, fields }) => {
    try {
      const fieldsQuery = fields.join(',');
      const response = await fetch(
        `https://api.infusionsoft.com/crm/rest/v1/opportunities?limit=${limit}&fields=${fieldsQuery}`,
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
            text: `Error fetching Keap opportunities: ${response.status} ${response.statusText}\n${errorText}`
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
          text: `Error fetching Keap opportunities: ${error instanceof Error ? error.message : String(error)}`
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
  console.error("Keap MCP Server running on stdio");
}

runServer().catch((error) => {
  console.error("Fatal error running server:", error);
  process.exit(1);
});