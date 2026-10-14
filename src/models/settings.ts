import type { AddressBlock, SignatureBlock } from "@/models/letter";

export interface UserSettings {
  id?: string;
  departmentHeading: string;
  defaultSender: AddressBlock;
  defaultRecipient: AddressBlock;
  defaultSignature: SignatureBlock;
  defaultSalutation: string;
}
