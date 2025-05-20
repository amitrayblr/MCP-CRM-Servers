import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import fetch from "node-fetch";

// GoHighLevel API base URL
const GHL_API_BASE = "https://rest.gohighlevel.com/v1";

// Create an MCP server
const server = new McpServer({
  name: "GoHighLevel Tools",
  version: "1.0.0",
  description: "MCP server providing tools to interact with GoHighLevel CRM"
});

// Helper function to make authenticated API requests
async function ghlRequest(apiKey: string, endpoint: string, method = "GET", body?: object) {
  const response = await fetch(`${GHL_API_BASE}${endpoint}`, {
    method,
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: body ? JSON.stringify(body) : undefined
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(`GoHighLevel API error: ${data.message || response.statusText}`);
  }
  
  return data;
}

// Define GoHighLevel tools

// 1. Get contacts
server.tool(
  "getContacts",
  {
    apiKey: z.string().describe("GoHighLevel API Key"),
    query: z.string().optional().describe("Search query"),
    page: z.number().optional().default(1).describe("Page number"),
    limit: z.number().optional().default(20).describe("Number of results per page")
  },
  async ({ apiKey, query, page, limit }) => {
    try {
      const queryParams = new URLSearchParams();
      if (query) queryParams.append("query", query);
      if (page) queryParams.append("page", page.toString());
      if (limit) queryParams.append("limit", limit.toString());
      
      const endpoint = `/contacts?${queryParams.toString()}`;
      const data = await ghlRequest(apiKey, endpoint);
      
      return {
        content: [{ 
          type: "text", 
          text: JSON.stringify(data, null, 2)
        }]
      };
    } catch (error: any) {
      return {
        content: [{ type: "text", text: `Error: ${error.message}` }],
        isError: true
      };
    }
  }
);

// 2. Get contact by ID
server.tool(
  "getContact",
  {
    apiKey: z.string().describe("GoHighLevel API Key"),
    contactId: z.string().describe("Contact ID")
  },
  async ({ apiKey, contactId }) => {
    try {
      const data = await ghlRequest(apiKey, `/contacts/${contactId}`);
      
      return {
        content: [{ 
          type: "text", 
          text: JSON.stringify(data, null, 2)
        }]
      };
    } catch (error: any) {
      return {
        content: [{ type: "text", text: `Error: ${error.message}` }],
        isError: true
      };
    }
  }
);

// 3. Create contact
server.tool(
  "createContact",
  {
    apiKey: z.string().describe("GoHighLevel API Key"),
    contactData: z.object({
      email: z.string().email().optional(),
      phone: z.string().optional(),
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      name: z.string().optional(),
      companyName: z.string().optional(),
      address1: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      country: z.string().optional(),
      postalCode: z.string().optional(),
      source: z.string().optional(),
      tags: z.array(z.string()).optional(),
      customField: z.record(z.string(), z.any()).optional()
    }).refine(data => data.email || data.phone, {
      message: "Either email or phone must be provided"
    })
  },
  async ({ apiKey, contactData }) => {
    try {
      const data = await ghlRequest(apiKey, "/contacts", "POST", contactData);
      
      return {
        content: [{ 
          type: "text", 
          text: JSON.stringify(data, null, 2)
        }]
      };
    } catch (error: any) {
      return {
        content: [{ type: "text", text: `Error: ${error.message}` }],
        isError: true
      };
    }
  }
);

// 4. Update contact
server.tool(
  "updateContact",
  {
    apiKey: z.string().describe("GoHighLevel API Key"),
    contactId: z.string().describe("Contact ID"),
    contactData: z.object({
      email: z.string().email().optional(),
      phone: z.string().optional(),
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      name: z.string().optional(),
      companyName: z.string().optional(),
      address1: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      country: z.string().optional(),
      postalCode: z.string().optional(),
      source: z.string().optional(),
      tags: z.array(z.string()).optional(),
      customField: z.record(z.string(), z.any()).optional()
    })
  },
  async ({ apiKey, contactId, contactData }) => {
    try {
      const data = await ghlRequest(apiKey, `/contacts/${contactId}`, "PUT", contactData);
      
      return {
        content: [{ 
          type: "text", 
          text: JSON.stringify(data, null, 2)
        }]
      };
    } catch (error: any) {
      return {
        content: [{ type: "text", text: `Error: ${error.message}` }],
        isError: true
      };
    }
  }
);

// 5. Add tags to contact
server.tool(
  "addContactTags",
  {
    apiKey: z.string().describe("GoHighLevel API Key"),
    contactId: z.string().describe("Contact ID"),
    tags: z.array(z.string()).describe("Tags to add")
  },
  async ({ apiKey, contactId, tags }) => {
    try {
      const data = await ghlRequest(apiKey, `/contacts/${contactId}/tags`, "POST", { tags });
      
      return {
        content: [{ 
          type: "text", 
          text: JSON.stringify(data, null, 2)
        }]
      };
    } catch (error: any) {
      return {
        content: [{ type: "text", text: `Error: ${error.message}` }],
        isError: true
      };
    }
  }
);

// 6. Remove tags from contact
server.tool(
  "removeContactTags",
  {
    apiKey: z.string().describe("GoHighLevel API Key"),
    contactId: z.string().describe("Contact ID"),
    tags: z.array(z.string()).describe("Tags to remove")
  },
  async ({ apiKey, contactId, tags }) => {
    try {
      const data = await ghlRequest(apiKey, `/contacts/${contactId}/tags`, "DELETE", { tags });
      
      return {
        content: [{ 
          type: "text", 
          text: JSON.stringify(data, null, 2)
        }]
      };
    } catch (error: any) {
      return {
        content: [{ type: "text", text: `Error: ${error.message}` }],
        isError: true
      };
    }
  }
);

// 7. Get tasks
server.tool(
  "getTasks",
  {
    apiKey: z.string().describe("GoHighLevel API Key"),
    page: z.number().optional().default(1).describe("Page number"),
    limit: z.number().optional().default(20).describe("Number of results per page")
  },
  async ({ apiKey, page, limit }) => {
    try {
      const queryParams = new URLSearchParams();
      if (page) queryParams.append("page", page.toString());
      if (limit) queryParams.append("limit", limit.toString());
      
      const endpoint = `/tasks?${queryParams.toString()}`;
      const data = await ghlRequest(apiKey, endpoint);
      
      return {
        content: [{ 
          type: "text", 
          text: JSON.stringify(data, null, 2)
        }]
      };
    } catch (error: any) {
      return {
        content: [{ type: "text", text: `Error: ${error.message}` }],
        isError: true
      };
    }
  }
);

// 8. Create task
server.tool(
  "createTask",
  {
    apiKey: z.string().describe("GoHighLevel API Key"),
    taskData: z.object({
      title: z.string().describe("Task title"),
      description: z.string().optional().describe("Task description"),
      dueDate: z.string().describe("Due date in ISO format"),
      completed: z.boolean().optional().default(false).describe("Task completion status"),
      assignedTo: z.string().optional().describe("User ID to assign task to"),
      contactId: z.string().optional().describe("Associated contact ID")
    })
  },
  async ({ apiKey, taskData }) => {
    try {
      const data = await ghlRequest(apiKey, "/tasks", "POST", taskData);
      
      return {
        content: [{ 
          type: "text", 
          text: JSON.stringify(data, null, 2)
        }]
      };
    } catch (error: any) {
      return {
        content: [{ type: "text", text: `Error: ${error.message}` }],
        isError: true
      };
    }
  }
);

// 9. Update task
server.tool(
  "updateTask",
  {
    apiKey: z.string().describe("GoHighLevel API Key"),
    taskId: z.string().describe("Task ID"),
    taskData: z.object({
      title: z.string().optional().describe("Task title"),
      description: z.string().optional().describe("Task description"),
      dueDate: z.string().optional().describe("Due date in ISO format"),
      completed: z.boolean().optional().describe("Task completion status"),
      assignedTo: z.string().optional().describe("User ID to assign task to")
    })
  },
  async ({ apiKey, taskId, taskData }) => {
    try {
      const data = await ghlRequest(apiKey, `/tasks/${taskId}`, "PUT", taskData);
      
      return {
        content: [{ 
          type: "text", 
          text: JSON.stringify(data, null, 2)
        }]
      };
    } catch (error: any) {
      return {
        content: [{ type: "text", text: `Error: ${error.message}` }],
        isError: true
      };
    }
  }
);

// 10. Delete task
server.tool(
  "deleteTask",
  {
    apiKey: z.string().describe("GoHighLevel API Key"),
    taskId: z.string().describe("Task ID")
  },
  async ({ apiKey, taskId }) => {
    try {
      const data = await ghlRequest(apiKey, `/tasks/${taskId}`, "DELETE");
      
      return {
        content: [{ 
          type: "text", 
          text: JSON.stringify(data, null, 2)
        }]
      };
    } catch (error: any) {
      return {
        content: [{ type: "text", text: `Error: ${error.message}` }],
        isError: true
      };
    }
  }
);

// 11. Get opportunities
server.tool(
  "getOpportunities",
  {
    apiKey: z.string().describe("GoHighLevel API Key"),
    pipelineId: z.string().optional().describe("Filter by pipeline ID"),
    stageId: z.string().optional().describe("Filter by stage ID"),
    page: z.number().optional().default(1).describe("Page number"),
    limit: z.number().optional().default(20).describe("Number of results per page")
  },
  async ({ apiKey, pipelineId, stageId, page, limit }) => {
    try {
      const queryParams = new URLSearchParams();
      if (pipelineId) queryParams.append("pipelineId", pipelineId);
      if (stageId) queryParams.append("stageId", stageId);
      if (page) queryParams.append("page", page.toString());
      if (limit) queryParams.append("limit", limit.toString());
      
      const endpoint = `/opportunities?${queryParams.toString()}`;
      const data = await ghlRequest(apiKey, endpoint);
      
      return {
        content: [{ 
          type: "text", 
          text: JSON.stringify(data, null, 2)
        }]
      };
    } catch (error: any) {
      return {
        content: [{ type: "text", text: `Error: ${error.message}` }],
        isError: true
      };
    }
  }
);

// 12. Create opportunity
server.tool(
  "createOpportunity",
  {
    apiKey: z.string().describe("GoHighLevel API Key"),
    opportunityData: z.object({
      name: z.string().describe("Opportunity name"),
      pipelineId: z.string().describe("Pipeline ID"),
      stageId: z.string().describe("Stage ID"),
      contactId: z.string().optional().describe("Associated contact ID"),
      monetaryValue: z.number().optional().describe("Monetary value"),
      assignedTo: z.string().optional().describe("User ID to assign to")
    })
  },
  async ({ apiKey, opportunityData }) => {
    try {
      const data = await ghlRequest(apiKey, "/opportunities", "POST", opportunityData);
      
      return {
        content: [{ 
          type: "text", 
          text: JSON.stringify(data, null, 2)
        }]
      };
    } catch (error: any) {
      return {
        content: [{ type: "text", text: `Error: ${error.message}` }],
        isError: true
      };
    }
  }
);

// 13. Get pipelines
server.tool(
  "getPipelines",
  {
    apiKey: z.string().describe("GoHighLevel API Key")
  },
  async ({ apiKey }) => {
    try {
      const data = await ghlRequest(apiKey, "/pipelines");
      
      return {
        content: [{ 
          type: "text", 
          text: JSON.stringify(data, null, 2)
        }]
      };
    } catch (error: any) {
      return {
        content: [{ type: "text", text: `Error: ${error.message}` }],
        isError: true
      };
    }
  }
);

// 14. Create calendar event
server.tool(
  "createCalendarEvent",
  {
    apiKey: z.string().describe("GoHighLevel API Key"),
    eventData: z.object({
      title: z.string().describe("Event title"),
      description: z.string().optional().describe("Event description"),
      startTime: z.string().describe("Start time in ISO format"),
      endTime: z.string().describe("End time in ISO format"),
      calendarId: z.string().describe("Calendar ID"),
      contacts: z.array(z.string()).optional().describe("Contact IDs to associate"),
      allDay: z.boolean().optional().default(false).describe("All-day event flag")
    })
  },
  async ({ apiKey, eventData }) => {
    try {
      const data = await ghlRequest(apiKey, "/calendars/events", "POST", eventData);
      
      return {
        content: [{ 
          type: "text", 
          text: JSON.stringify(data, null, 2)
        }]
      };
    } catch (error: any) {
      return {
        content: [{ type: "text", text: `Error: ${error.message}` }],
        isError: true
      };
    }
  }
);

// 15. Get calendars
server.tool(
  "getCalendars",
  {
    apiKey: z.string().describe("GoHighLevel API Key")
  },
  async ({ apiKey }) => {
    try {
      const data = await ghlRequest(apiKey, "/calendars");
      
      return {
        content: [{ 
          type: "text", 
          text: JSON.stringify(data, null, 2)
        }]
      };
    } catch (error: any) {
      return {
        content: [{ type: "text", text: `Error: ${error.message}` }],
        isError: true
      };
    }
  }
);

// Run the server
async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("GoHighLevel MCP Server running on stdio");
}

runServer().catch((error) => {
  console.error("Fatal error running server:", error);
  process.exit(1);
});