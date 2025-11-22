"use server";

import { backendClient } from "@/sanity/lib/backendClient";

export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export async function createContactSubmission(formData: ContactFormData) {
  try {
    const contact = await backendClient.create({
      _type: "contact",
      name: formData.name,
      email: formData.email,
      phone: formData.phone || "",
      subject: formData.subject,
      message: formData.message,
      submittedAt: new Date().toISOString(),
      isRead: false,
    });

    return { success: true, data: contact };
  } catch (error) {
    console.error("Error creating contact submission:", error);
    return { success: false, error: "Failed to submit contact form" };
  }
}