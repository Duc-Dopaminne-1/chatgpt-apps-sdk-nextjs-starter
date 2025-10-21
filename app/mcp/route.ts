import { baseURL } from "@/baseUrl";
import { createMcpHandler } from "mcp-handler";
import { z } from "zod";

const getAppsSdkCompatibleHtml = async (baseUrl: string, path: string) => {
  const result = await fetch(`${baseUrl}${path}`);
  return await result.text();
};

type ContentWidget = {
  id: string;
  title: string;
  templateUri: string;
  invoking: string;
  invoked: string;
  html: string;
  description: string;
  widgetDomain: string;
};

function widgetMeta(widget: ContentWidget) {
  return {
    "openai/outputTemplate": widget.templateUri,
    "openai/toolInvocation/invoking": widget.invoking,
    "openai/toolInvocation/invoked": widget.invoked,
    "openai/widgetAccessible": false,
    "openai/resultCanProduceWidget": true,
  } as const;
}

const handler = createMcpHandler(async (server) => {
  const html = await getAppsSdkCompatibleHtml(baseURL, "/");
  const customPageHtml = await getAppsSdkCompatibleHtml(baseURL, "/custom-page");

  const contentWidget: ContentWidget = {
    id: "show_content",
    title: "Show Content",
    templateUri: "ui://widget/content-template.html",
    invoking: "Loading content...",
    invoked: "Content loaded",
    html: html,
    description: "Displays the homepage content",
    widgetDomain: "https://nextjs.org/docs",
  };

  const customPageWidget: ContentWidget = {
    id: "show_custom_page",
    title: "Show Custom Page",
    templateUri: "ui://widget/custom-page-template.html",
    invoking: "Loading custom page...",
    invoked: "Custom page loaded",
    html: customPageHtml,
    description: "Displays the custom page content",
    widgetDomain: "https://nextjs.org/docs",
  };
  server.registerResource(
    "content-widget",
    contentWidget.templateUri,
    {
      title: contentWidget.title,
      description: contentWidget.description,
      mimeType: "text/html+skybridge",
      _meta: {
        "openai/widgetDescription": contentWidget.description,
        "openai/widgetPrefersBorder": true,
      },
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: "text/html+skybridge",
          text: `<html>${contentWidget.html}</html>`,
          _meta: {
            "openai/widgetDescription": contentWidget.description,
            "openai/widgetPrefersBorder": true,
            "openai/widgetDomain": contentWidget.widgetDomain,
          },
        },
      ],
    })
  );

  server.registerResource(
    "custom-page-widget",
    customPageWidget.templateUri,
    {
      title: customPageWidget.title,
      description: customPageWidget.description,
      mimeType: "text/html+skybridge",
      _meta: {
        "openai/widgetDescription": customPageWidget.description,
        "openai/widgetPrefersBorder": true,
      },
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: "text/html+skybridge",
          text: `<html>${customPageWidget.html}</html>`,
          _meta: {
            "openai/widgetDescription": customPageWidget.description,
            "openai/widgetPrefersBorder": true,
            "openai/widgetDomain": customPageWidget.widgetDomain,
          },
        },
      ],
    })
  );

  server.registerTool(
    contentWidget.id,
    {
      title: contentWidget.title,
      description:
        "Fetch and display the homepage content with the name of the user",
      inputSchema: {
        name: z.string().describe("The name of the user to display on the homepage"),
      },
      _meta: widgetMeta(contentWidget),
    },
    async ({ name }) => {
      return {
        content: [
          {
            type: "text",
            text: name,
          },
        ],
        structuredContent: {
          name: name,
          timestamp: new Date().toISOString(),
        },
        _meta: widgetMeta(contentWidget),
      };
    }
  );

  server.registerTool(
    customPageWidget.id,
    {
      title: customPageWidget.title,
      description: "Display the custom page with welcome message and navigation",
      inputSchema: {},
      _meta: widgetMeta(customPageWidget),
    },
    async () => {
      return {
        content: [
          {
            type: "text",
            text: "Custom page displayed successfully",
          },
        ],
        structuredContent: {
          message: "Welcome to the custom page!",
          timestamp: new Date().toISOString(),
        },
        _meta: widgetMeta(customPageWidget),
      };
    }
  );
});

export const GET = handler;
export const POST = handler;
