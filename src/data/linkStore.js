const categories = [
  {
    id: "core-daily-tools",
    title: "Core Daily Tools",
    description: "Your always-open systems for daily triage and operations.",
    links: [
      {
        id: "powerschool",
        name: "PowerSchool",
        url: "https://www.powerschool.com/",
        meta: "SIS / attendance / student info"
      },
      {
        id: "google-drive",
        name: "Google Drive",
        url: "https://drive.google.com/",
        meta: "Files, docs, and shared folders"
      },
      {
        id: "incident-iq",
        name: "Incident IQ",
        url: "https://www.incidentiq.com/",
        meta: "Help desk tickets and asset context"
      },
      {
        id: "mosyle",
        name: "Mosyle",
        url: "https://my.mosyle.com/",
        meta: "Apple device management"
      }
    ]
  },
  {
    id: "apple-identity",
    title: "Apple + Identity",
    description: "Anything tied to Apple ecosystem setup and account work.",
    links: [
      {
        id: "apple-school-manager",
        name: "Apple School Manager",
        url: "https://school.apple.com/",
        meta: "Managed Apple IDs and enrollment"
      },
      {
        id: "google-admin",
        name: "Google Admin",
        url: "https://admin.google.com/",
        meta: "Users, groups, policies"
      }
    ]
  },
  {
    id: "local-team-resources",
    title: "Local + Team Resources",
    description: "District-specific tools, docs, and internal references.",
    links: [
      {
        id: "brads-site",
        name: "Brad's Site",
        url: "https://example.local/",
        meta: "Local documentation or utilities"
      },
      {
        id: "master-ops-sheet",
        name: "Master Operations Sheet",
        url: "#",
        meta: "Replace with your Google Sheet URL"
      }
    ]
  }
];

module.exports = {
  categories
};
