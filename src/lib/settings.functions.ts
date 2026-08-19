import { createServerFn } from "@tanstack/react-start";

export const getGlobalSettings = createServerFn({ method: "GET" }).handler(async () => {
  return {
    currency: "FCFA",
    timezone: "Africa/Niamey",
    dateFormat: "DD/MM/YYYY",
    companyName: "Multi Services Immobilière",
    location: "Maradi, Niger",
  };
});
