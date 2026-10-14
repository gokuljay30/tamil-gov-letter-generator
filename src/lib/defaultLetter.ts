import type { LetterDocument } from "@/models/letter";

export const createDefaultLetter = (): LetterDocument => ({
  id: "local-draft",
  status: "draft",
  letterType: "government_letter",
  typeData: {
    presidingOfficer: "",
    accountHeadLines: [],
    copyToLines: [],
    submittedCopyToLines: [],
    receiptTitle: "இரசீது",
    receiptSignature: "",
    receiptName: "",
    receiptAddress: ""
  },
  boldHeaders: true,
  fontSizeStep: 0,
  departmentHeading: "துறையின் பெயர்",
  sender: {
    lines: [
      "அலுவலர் பெயர்",
      "பதவி",
      "அலுவலகம்",
      "ஊர்"
    ]
  },
  recipient: {
    lines: [
      "பெறுநர் பதவி",
      "துறை / அலுவலகம்",
      "ஊர்"
    ]
  },
  fileNumber: "1/2025",
  date: "30-12-2025",
  salutation: "ஐயா,",
  subject:
    "ABC நிறுவனம் - Oxygen cylinder பெறப்பட்டது - Tax Invoice அனுப்புவது தொடர்பாக",
  references: [
    "மாதிரி அலுவலக கடித எண் 4521/B/DEPT/2025 நாள் : 17-11-2025"
  ],
  body:
    "பணிவுடன் தெரிவித்துக் கொள்வது யாதெனில்,\n\nபார்வையில் கண்ட கடிதம் வழி இம்மருத்துவமனையில் செயல்படும் ABC நிறுவனம் மூலம் வழங்கப்பட்ட இரண்டு Oxygen cylinder-கள் பெறப்பட்டதற்கான Tax Invoice-ஐ உரிய பணம் செலுத்தும் பொருட்டு இத்துடன் இணைத்து அனுப்புகிறேன் எனத் தெரிவித்துக் கொள்கிறேன்.",
  signature: {
    closing: "தங்கள் உண்மையுள்ள",
    lines: [
      "பதவி",
      "அலுவலகம்",
      "ஊர்"
    ]
  },
  updatedAt: new Date().toISOString()
});
