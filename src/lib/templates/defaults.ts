import type { AddressBlock, SignatureBlock } from "@/models/letter";
import type { TemplateVariable } from "@/models/template";

interface TemplateDefaults {
  user_id: string;
  template_key: string;
  name: string;
  category: string;
  description: string;
  department_heading: string;
  sender: AddressBlock;
  recipient: AddressBlock;
  salutation: string;
  subject: string;
  references: string[];
  body: string;
  signature: SignatureBlock;
  variables: TemplateVariable[];
}

const variable = (key: string, label: string, type: TemplateVariable["type"] = "text"): TemplateVariable => ({
  key, label, type, required: false, defaultValue: ""
});

export function createStarterTemplates(userId: string, defaults: {
  departmentHeading: string;
  sender: AddressBlock;
  recipient: AddressBlock;
  salutation: string;
  signature: SignatureBlock;
}): TemplateDefaults[] {
  return [
    {
      user_id: userId,
      template_key: "oxygen_invoice_default",
      name: "ஆக்சிஜன் சிலிண்டர் - Tax Invoice",
      category: "Invoice / Equipment",
      description: "ஆக்சிஜன் சிலிண்டர் பெறப்பட்டதற்கான Tax Invoice அனுப்பும் கடிதம்.",
      department_heading: defaults.departmentHeading,
      sender: defaults.sender,
      recipient: defaults.recipient,
      salutation: defaults.salutation,
      subject: "{{company_name}} - {{quantity}} Oxygen cylinder பெறப்பட்டது - Tax Invoice அனுப்புவது தொடர்பாக",
      references: ["{{reference_number}} நாள்: {{reference_date}}"],
      body: "பணிவுடன் தெரிவித்துக் கொள்வது யாதெனில்,\n\nபார்வையில் கண்ட கடிதம் வழி இம்மருத்துவமனையில் செயல்படும் {{company_name}} மையத்திற்கு வழங்கப்பட்ட {{quantity}} Oxygen cylinder-கள் பெறப்பட்டதற்கான Tax Invoice எண் {{invoice_number}}, நாள் {{invoice_date}}-ஐ உரிய தொகை {{amount}} செலுத்தும் பொருட்டு இத்துடன் இணைத்து அனுப்புகிறேன் எனத் தெரிவித்துக் கொள்கிறேன்.",
      signature: defaults.signature,
      variables: [
        variable("company_name", "நிறுவனம் / Company"),
        variable("quantity", "எண்ணிக்கை / Quantity", "number"),
        variable("invoice_number", "Invoice Number"),
        variable("invoice_date", "Invoice Date", "date"),
        variable("amount", "தொகை / Amount", "number"),
        variable("reference_number", "பார்வை எண் / Reference Number"),
        variable("reference_date", "பார்வை நாள் / Reference Date", "date")
      ]
    },
    {
      user_id: userId,
      template_key: "leave_request_default",
      name: "விடுப்பு விண்ணப்பம்",
      category: "Administration",
      description: "அலுவலருக்கான பொதுவான விடுப்புக் கோரிக்கை கடிதம்.",
      department_heading: defaults.departmentHeading,
      sender: defaults.sender,
      recipient: defaults.recipient,
      salutation: defaults.salutation,
      subject: "{{leave_type}} விடுப்பு கோருதல் தொடர்பாக",
      references: [],
      body: "பணிவுடன் தெரிவித்துக் கொள்வது யாதெனில்,\n\n{{from_date}} முதல் {{to_date}} வரை {{number_of_days}} நாட்கள் {{leave_reason}} காரணமாக {{leave_type}} விடுப்பு வழங்குமாறு பணிவுடன் கேட்டுக் கொள்கிறேன்.",
      signature: defaults.signature,
      variables: [
        variable("leave_type", "விடுப்பு வகை / Leave Type"),
        variable("from_date", "விடுப்பு தொடங்கும் நாள் / From Date", "date"),
        variable("to_date", "விடுப்பு முடியும் நாள் / To Date", "date"),
        variable("number_of_days", "நாட்களின் எண்ணிக்கை / Number of Days", "number"),
        variable("leave_reason", "விடுப்புக் காரணம் / Reason", "textarea")
      ]
    }
  ];
}

