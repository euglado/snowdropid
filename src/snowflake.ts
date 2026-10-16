export const EPOCH = 1420070400000n;
export const MAX_ID = (1n << 64n) - 1n;
export type Lang = "tr" | "en";
export type Result = {
  id: string;
  milliseconds: number;
  seconds: number;
  iso: string;
};

export function parseId(input: string): bigint {
  if (!/^[1-9][0-9]{0,19}$/.test(input)) throw new Error("id");
  const id = BigInt(input);
  if (id > MAX_ID || id.toString() !== input) throw new Error("id");
  return id;
}

export function decode(input: string, now = Date.now()): Result {
  if (!Number.isSafeInteger(now) || now < Number(EPOCH))
    throw new Error("clock");
  const milliseconds = Number((parseId(input) >> 22n) + EPOCH);
  if (milliseconds > now) throw new Error("future");
  return {
    id: input,
    milliseconds,
    seconds: Math.floor(milliseconds / 1000),
    iso: new Date(milliseconds).toISOString(),
  };
}

export const styles = ["t", "T", "d", "D", "f", "F", "R"] as const;
export function report(result: Result, lang: Lang, formats = false): string {
  const tr = lang === "tr";
  const title = tr
    ? "SnowdropID — özel tarih önizlemesi"
    : "SnowdropID — private date preview";
  const warning = tr
    ? "Bu sayıdan hesaplanan zamandır. Kimliğin varlığı, nesne türü veya sahibinin güvenilirliği doğrulanmaz. Moderasyon kararı için kullanmayın."
    : "Time calculated from this number. Existence, object type and owner trust are not verified. Do not use for moderation decisions.";
  const help = tr
    ? "Yerel tarih Discord ayarlarınıza göre görünür. ISO zamanı UTC'dir ve milisaniyeyi korur; Discord biçimleri saniyeye yuvarlanır (aşağı). Rapor ve düğmeler 5 dakika etkindir."
    : "Local date follows your Discord settings. ISO time is UTC and preserves milliseconds; Discord formats floor to seconds. Report controls last 5 minutes.";
  const content = [
    `**${title}**`,
    `ID: \`${result.id}\``,
    `UTC: \`${result.iso}\``,
    `${tr ? "Yerel" : "Local"}: <t:${result.seconds}:F>`,
    `${tr ? "Göreli" : "Relative"}: <t:${result.seconds}:R>`,
    warning,
    help,
  ];
  if (formats) {
    content.push(
      tr
        ? "**Kopyalanabilir Discord biçimleri** (kopyalama elle yapılır)"
        : "**Copyable Discord formats** (copy manually)",
    );
    for (const style of styles)
      content.push(
        `\`<t:${result.seconds}:${style}>\` → <t:${result.seconds}:${style}>`,
      );
  }
  return content.join("\n");
}

export function problem(lang: Lang, code = "unavailable"): string {
  const texts: Record<string, [string, string]> = {
    id: [
      "Yalnızca 1–20 basamaklı, sıfırla başlamayan Discord ID girin; bağlantı/etiket kullanmayın. Sayı 64 bit sınırında olmalı.",
      "Enter a 1–20 digit Discord ID without leading zeroes, links or mentions. It must fit unsigned 64 bits.",
    ],
    future: [
      "Bu sayı gelecekte bir zaman veriyor. ID'yi ve bilgisayarın UTC saatini kontrol edin.",
      "This number encodes a future time. Check the ID and your computer's UTC clock.",
    ],
    clock: [
      "Bilgisayarın UTC saati geçersiz; operatörden düzeltmesini isteyin.",
      "The computer's UTC clock is invalid; ask the operator to correct it.",
    ],
    busy: [
      "Çok hızlı veya kapasite dolu. Birkaç saniye sonra yeniden deneyin.",
      "Too fast or at capacity. Try again in a few seconds.",
    ],
    session: [
      "Bu kontrol size ait değil, süresi doldu veya bot yeniden başladı. /snowdropid ile yeni rapor açın.",
      "This control is not yours, expired or the bot restarted. Open a new report with /snowdropid.",
    ],
    access: [
      "Yalnızca yapılandırılmış sunucuda, Kanalı Görüntüle izniyle çalışır. Botun Yönetici iznini kaldırın.",
      "Use the configured server with View Channel permission. Remove the bot's Administrator permission.",
    ],
    closed: [
      "Rapor kapatıldı; geçici kayıt silindi.",
      "Report closed; temporary record removed.",
    ],
    unavailable: [
      "İşlem tamamlanamadı. Biraz bekleyip yeniden deneyin; operatör bağlantıyı kontrol edebilir.",
      "Could not complete the operation. Try again shortly; the operator can check connectivity.",
    ],
  };
  return (
    (texts[code] ?? texts.unavailable)?.[lang === "tr" ? 0 : 1] ?? "Unavailable"
  );
}
