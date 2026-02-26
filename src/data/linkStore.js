const categories = [
  {
    id: "core-daily-tools",
    title: "Core Daily Tools",
    description: "Your always-open systems for daily triage and operations.",
    links: [
      {
        id: "powerschool",
        name: "PowerSchool",
        url: "https://oxfordcs.powerschool.com/admin/home.html",
        meta: "SIS / attendance / student info"
      },
      {
        id: "google-drive",
        name: "IT  Drive",
        url: "https://drive.google.com/drive/folders/1QFpMlU0nzf-JIolfMwbMRPaqseKdZHLB",
        meta: "Files, docs, and shared folders"
      },
      {
        id: "incident-iq",
        name: "Incident IQ",
        url: "https://brad.oxboe.com/iiq/",
        meta: "Help desk tickets and asset context"
      },
      {
        id: "mosyle",
        name: "Mosyle",
        url: "https://myschool.mosyle.com/",
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
        meta: "Managed Apple IDs"
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
        url: "https://brad.oxboe.com/",
        meta: "Brad's tools"
      },
      {
        id: "master-repair-sheet",
        name: "Master Repair Sheet",
        url: "https://docs.google.com/spreadsheets/d/1UyWUk7dGL9UhWfMxWRARNcTSuFlRbM7jvyKEjJoDHM0/edit?gid=669326704#gid=669326704",
        meta: "Master Repair Sheet"
      }
    ]
  }
];

module.exports = {
  categories
};
