const ALLOWED_AUDIO_TYPES = new Set(["audio/webm", "audio/mp4", "audio/ogg", "audio/wav", "audio/x-wav", "audio/mpeg"]);

export function isAllowedAudioType(type: string): boolean {
  if (!type) return true;
  return ALLOWED_AUDIO_TYPES.has(type.split(";", 1)[0].trim().toLowerCase());
}
